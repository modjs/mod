## <a href="#<%= name %>" name="<%= name %>"><%= name %></a>
> <%= summary %>

<% if(typeof properties !== 'undefined' && !_.isEmpty(properties)){ %>
### Properties
<% _.each(properties, function(property) { %>
#### <%= property.name %>
<% if(typeof property.describe !== 'undefined'){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> <%= property.describe.ucfirst() %></p><% } %>
<hr>
<% }); %>
<% } %>

<% if(typeof methods !== 'undefined' && !_.isEmpty(methods)){ %>
### Methods
<% _.each(methods, function(method) { %>
#### <%= method.name %>
<% if(method.describe){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> <%= method.describe.ucfirst() %></p><% } %>
<% if(method.ret){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Return:</b> <code><%= method.ret %></code></p><% } %>
<% if(method.example){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Example:</b></p>
```js
<%= method.example %>
```
<% } %>
<hr>
<% }); %>
<% } %>


