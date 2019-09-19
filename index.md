
{% for post in site.posts %}
  <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
  <div>
      <p class="author_title">{{ post.date | date: "%d. %m. %Y" }}</p>
      <div class="post-tags">
        {% if post %}
          {% assign categories = post.categories %}
        {% else %}
          {% assign categories = page.categories %}
        {% endif %}
        {% for category in categories %}
          <a href="{{site.baseurl}}/categories/#{{category|slugize}}">{{category}}</a>
          {% unless forloop.last %}&nbsp;{% endunless %}
        {% endfor %}
      </div>
  </div>
  {{ post.content | strip_html | truncatewords:50, ""}} <a href="{{ post.url }}">...číst dál...</a>
{% endfor %}
