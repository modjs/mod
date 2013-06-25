## <a href="#<%= taskName %>" name="<%= taskName %>"><%= taskName %></a>
> <%= summary %>

### Usage

```sh
$ mod <%= taskName %> <%= usage %>
```
<% if(typeof options !== 'undefined' && !_.isEmpty(options)){ %>
### Options
<% _.each(options, function(option, name) { %>
#### <%= name %>
<% if(typeof option.type !== 'undefined'){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Type:</b> <code><%= option.type %></code></p><% } %>
<% if(typeof option.default !== 'undefined'){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Default:</b> <code><%= option.default %></code></p><% } %>
<% if(typeof option.describe !== 'undefined'){ %><p> <b>&nbsp;&nbsp;&nbsp;&nbsp;Describe:</b> <%= option.describe.ucfirst() %></p><% } %>
<hr>
<% }); %>
<% } %>





