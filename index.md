---
layout: post 
title: Portfolio Home 
hide: true
show_reading_time: false
---



Hi! We are the Goat Group

Scrum Master: Rishab

Assistant Scrum Master: Aashi

Scrums: Joshika, Adam, Ayden, Kashyap

### Development Environment

> Coding starts with tools, explore these tools and procedures with a click.

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <a href="https://github.com/Open-Coding-Society/student">
        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
    </a>
    <a href="https://open-coding-society.github.io/student">
        <img src="https://img.shields.io/badge/GitHub%20Pages-327FC7?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
    </a>
    <a href="https://kasm.opencodingsociety.com/">
        <img src="https://img.shields.io/badge/KASM-0078D4?style=for-the-badge&logo=kasm&logoColor=white" alt="KASM">
    </a>
    <a href="https://vscode.dev/">
        <img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white" alt="VSCode">
    </a>
</div>

<br>

### Class Progress

> Here is my progress through coding, click to see these online

<div style="display: flex; flex-wrap: wrap; gap: 10px;">
    <a href="{{site.baseurl}}/snake" style="text-decoration: none;">
        <div style="background-color: #00FF00; color: black; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Snake Game
        </div>
    </a>
    <a href="{{site.baseurl}}/custompong" style="text-decoration: none;">
        <div style="background-color: #FF0000; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Pong 
        </div>
    </a>
    <a href="{{site.baseurl}}/javascript/project/blackjack" style="text-decoration: none;">
        <div style="background-color: #3300ffff; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;">
            Black Jack
        </div>
    </a>
</div>

<br>

### Hacks

> Quick links to all hacks in the `hacks/` folder.

<div style="display:flex; flex-wrap:wrap; gap:10px;">
{% assign colors = "#e74c3c,#3498db,#2ecc71,#f1c40f,#9b59b6,#1abc9c,#e67e22,#34495e,#7f8c8d,#d35400" | split: "," %}
{% assign hack_pages = site.pages | where_exp: "p", "p.path contains 'hacks/'" %}
{% for p in hack_pages %}
    {% assign idx = forloop.index0 | modulo: colors.size %}
    {% assign color = colors[idx] %}
    <a href="{{ p.url | prepend: site.baseurl }}" style="text-decoration:none;">
        <div style="background-color: {{ color }}; color: white; padding:10px 16px; border-radius:6px; font-weight:600;">
            {{ p.title | default: p.path | replace: 'hacks/','' | replace: '.md','' | replace: '.markdown','' }}
        </div>
    </a>
{% endfor %}
</div>


<!-- Contact Section -->
### Get in Touch

> Feel free to reach out if you'd like to collaborate or learn more about our work.

<p style="color: #2A7DB1;">Open Coding Society: <a href="https://opencodingsociety.com" style="color: #2A7DB1; text-decoration: underline;">Socials</a></p>
