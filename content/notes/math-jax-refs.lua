-- The pandoc latex reader turns eqrefs into a Link element, but MathJax is able to to resolve eqrefs if they're
-- placed inside math delimeters. Hence, we use a lua filter to turn eqref Links to InlineMaths

function Link(el)
  if el.attributes["reference-type"] == "eqref" then
    return pandoc.Math("InlineMath", "\\eqref{" .. el.attributes["reference"] .. "}")
  end
end
