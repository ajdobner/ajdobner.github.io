-- From https://stackoverflow.com/questions/73417580/specify-pandoc-html-numbering-to-start-from-h2
-- Used to correctly produce h2 elements from latex \sections and still give the right numbering with --number-sections

function Pandoc (doc)
  -- Create and number sections. Setting the first parameter to
  -- `true` ensures that headings are numbered.
  doc.blocks = pandoc.utils.make_sections(true, nil, doc.blocks)

  -- Shift the heading levels by 1
  doc.blocks = doc.blocks:walk {
    Header = function (h)
      h.level = h.level + 1
      return h
    end
  }

  -- Return the modified document
  return doc
end
