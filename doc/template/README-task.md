## <%= name %>
<% _.each(items, function(item) { %>
* [<%= item.title %>](<%= item.href %>) - <%= item.summary.ucfirst() %> <% }); %>
