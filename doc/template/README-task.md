## Built-in Tasks
Mod supports a powerful set of high-level tasks:
<% _.each(items, function(item) { %>
* [<%= item.title %>](<%= item.href %>) - <%= item.summary.lcfirst() %> <% }); %>
