---
is_dynamic: true
---

Coming soon.
<% @items.find_all('/notes/*/FAKE').each do |note| %>
  * [<%= note[:title] %>](<%= note.path %>)
<% end %>
