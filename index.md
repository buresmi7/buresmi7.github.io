
{% for post in site.posts %}
  <h2>{{ post.title }}</h2>
  {{ post.content | strip_html | truncatewords:75}}
  <p><a href="{{ post.url }}">Zobrazit celé...</a></p>
{% endfor %}
