/* -*- Mode: C++; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 sw=2 et tw=78: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_dom_SVGScriptElement_h
#define mozilla_dom_SVGScriptElement_h

#include "nsSVGElement.h"
#include "nsCOMPtr.h"
#include "nsSVGString.h"
#include "nsScriptElement.h"

class nsIDocument;

nsresult NS_NewSVGScriptElement(nsIContent **aResult,
                                already_AddRefed<nsINodeInfo> aNodeInfo,
                                mozilla::dom::FromParser aFromParser);

namespace mozilla {
namespace dom {

typedef nsSVGElement SVGScriptElementBase;

class SVGScriptElement MOZ_FINAL : public SVGScriptElementBase,
                                   public nsScriptElement
{
protected:
  friend nsresult (::NS_NewSVGScriptElement(nsIContent **aResult,
                                            already_AddRefed<nsINodeInfo> aNodeInfo,
                                            mozilla::dom::FromParser aFromParser));
  SVGScriptElement(already_AddRefed<nsINodeInfo> aNodeInfo,
                   FromParser aFromParser);

  virtual JSObject* WrapNode(JSContext *aCx,
                             JS::Handle<JSObject*> aScope) MOZ_OVERRIDE;

public:
  // interfaces:

  NS_DECL_ISUPPORTS_INHERITED

  // nsIScriptElement
  virtual void GetScriptType(nsAString& type);
  virtual void GetScriptText(nsAString& text);
  virtual void GetScriptCharset(nsAString& charset);
  virtual void FreezeUriAsyncDefer();
  virtual CORSMode GetCORSMode() const;

  // nsScriptElement
  virtual bool HasScriptContent();

  // nsIContent specializations:
  virtual nsresult BindToTree(nsIDocument* aDocument, nsIContent* aParent,
                              nsIContent* aBindingParent,
                              bool aCompileEventHandlers);
  virtual nsresult AfterSetAttr(int32_t aNamespaceID, nsIAtom* aName,
                                const nsAttrValue* aValue, bool aNotify);
  virtual bool ParseAttribute(int32_t aNamespaceID,
                              nsIAtom* aAttribute,
                              const nsAString& aValue,
                              nsAttrValue& aResult);

  virtual nsresult Clone(nsINodeInfo *aNodeInfo, nsINode **aResult) const;

  // WebIDL
  void GetType(nsAString & aType);
  void SetType(const nsAString & aType, ErrorResult& rv);
  void GetCrossOrigin(nsAString & aOrigin);
  void SetCrossOrigin(const nsAString & aOrigin, ErrorResult& rv);
  already_AddRefed<nsIDOMSVGAnimatedString> Href();

protected:
  virtual StringAttributesInfo GetStringInfo();

  enum { HREF };
  nsSVGString mStringAttributes[1];
  static StringInfo sStringInfo[1];
};

} // namespace dom
} // namespace mozilla

#endif // mozilla_dom_SVGScriptElement_h
