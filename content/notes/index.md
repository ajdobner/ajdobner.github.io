---
is_dynamic: true
---

Coming soon.
<% @items.find_all('/notes/**/*.md').each do |note| %>
  * [<%= note[:title] %>](<%= note.path %>)
<% end %>
