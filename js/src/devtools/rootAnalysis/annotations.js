/* -*- Mode: Javascript; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */

"use strict";

var ignoreIndirectCalls = {
    "mallocSizeOf" : true,
    "aMallocSizeOf" : true,
    "_malloc_message" : true,
    "__conv" : true,
    "__convf" : true,
    "prerrortable.c:callback_newtable" : true,
    "mozalloc_oom.cpp:void (* gAbortHandler)(size_t)" : true,
    "JSObject* js::GetWeakmapKeyDelegate(JSObject*)" : true, // FIXME: mark with AutoAssertNoGC instead
};


function indirectCallCannotGC(caller, name)
{
    if (name in ignoreIndirectCalls)
        return true;

    if (name == "mapper" && caller == "ptio.c:pt_MapError")
        return true;

    if (name == "params" && caller == "PR_ExplodeTime")
        return true;

    // hook called during script finalization which cannot GC.
    if (/CallDestroyScriptHook/.test(caller))
        return true;

    return false;
}

// classes to ignore indirect calls on.
var ignoreClasses = {
    "JSTracer" : true,
    "JSStringFinalizer" : true,
    "SprintfStateStr" : true,
    "JSLocaleCallbacks" : true,
    "JSC::ExecutableAllocator" : true,
    "PRIOMethods": true,
    "XPCOMFunctions" : true, // I'm a little unsure of this one
    "_MD_IOVector" : true,
};

var ignoreCallees = {
    "js::Class.trace" : true,
    "js::Class.finalize" : true,
    "JSRuntime.destroyPrincipals" : true,
    "nsISupports.AddRef" : true,
    "nsISupports.Release" : true, // makes me a bit nervous; this is a bug but can happen
    "nsAXPCNativeCallContext.GetJSContext" : true,
};

function fieldCallCannotGC(csu, fullfield)
{
    if (csu in ignoreClasses)
        return true;
    if (fullfield in ignoreCallees)
        return true;
    return false;
}

function shouldSuppressGC(name)
{
    // Various dead code that should only be called inside AutoEnterAnalysis.
    // Functions with no known caller are by default treated as not suppressing GC.
    return /TypeScript::Purge/.test(name)
        || /StackTypeSet::addPropagateThis/.test(name)
        || /ScriptAnalysis::addPushedType/.test(name)
        || /IonBuilder/.test(name);
}

function ignoreEdgeUse(edge, variable)
{
    // Functions which should not be treated as using variable.
    if (edge.Kind == "Call") {
        var callee = edge.Exp[0];
        if (callee.Kind == "Var") {
            var name = callee.Variable.Name[0];
            if (/~Anchor/.test(name))
                return true;
            if (/::Unrooted\(\)/.test(name))
                return true;
            if (/::~Unrooted\(\)/.test(name))
                return true;
            if (/~DebugOnly/.test(name))
                return true;
        }
    }

    return false;
}

var ignoreFunctions = {
    "ptio.c:pt_MapError" : true,
    "PR_ExplodeTime" : true,
    "PR_ErrorInstallTable" : true,
    "PR_SetThreadPrivate" : true
};

function ignoreGCFunction(fun)
{
    if (fun in ignoreFunctions)
        return true;

    // Templatized function
    if (fun.indexOf("void nsCOMPtr<T>::Assert_NoQueryNeeded()") >= 0)
        return true;

    // XXX modify refillFreeList<NoGC> to not need data flow analysis to understand it cannot GC.
    if (/refillFreeList/.test(fun) && /\(js::AllowGC\)0u/.test(fun))
        return true;
    return false;
}

function isRootedTypeName(name)
{
    if (name == "mozilla::ErrorResult" ||
        name == "js::frontend::TokenStream::Position")
    {
        return true;
    }
    return false;
}

function isRootedPointerTypeName(name)
{
    if (name.startsWith('struct '))
        name = name.substr(7);
    if (name.startsWith('class '))
        name = name.substr(6);
    if (name.startsWith('const '))
        name = name.substr(6);
    if (name.startsWith('js::'))
        name = name.substr(4);
    if (name.startsWith('JS::'))
        name = name.substr(4);

    if (name.startsWith('MaybeRooted<'))
        return /\(js::AllowGC\)1u>::RootType/.test(name);

    return name.startsWith('Rooted');
}

function isSuppressConstructor(name)
{
    return /::AutoSuppressGC/.test(name)
        || /::AutoEnterAnalysis/.test(name);
}
