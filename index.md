
{% for post in site.posts reversed %}
  <h2>{{ post.title }}</h2>
  <p><small>{{ post.date | date: "%d. %m. %Y"}}, kategorie: {{ post.category }}</small></p>
  {{ post.content | strip_html | truncatewords:50, ""}} <a href="{{ post.url }}">...číst dál...</a>
{% endfor %}
