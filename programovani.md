---
layout: default
title: články v kategorii programování
---

<h2>články v kategorii programování</h2>

{% for post in site.posts %}
  {% if post.category == 'programovani' %}
    <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <p><small>{{ post.date | date: "%d. %m. %Y"}}, kategorie: {{ post.category_title }}</small></p>
    {{ post.content | strip_html | truncatewords:50, ""}} <a href="{{ post.url }}">...číst dál...</a>
  {% endif %}
{% endfor %}