
{% for post in site.posts %}
  <h2>{{ post.title }}</h2>
  {{ post.content | strip_html | truncatewords:50, ""}} <a href="{{ post.url }}">Číst dál...</a>
{% endfor %}
