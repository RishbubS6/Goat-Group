---
layout: opencs
title: Solitaire
permalink: /solitaire
---



{
 "cells": [
  {
   "cell_type": "raw",
   "id": "43b8b987",
   "metadata": {
    "vscode": {
     "languageId": "raw"
    }
   },
   "source": [
    "---\n",
    "layout: lessonbase\n",
    "title: Object-Oriented Programming (OOP) Concepts Through Solitaire\n",
    "description: Learn fundamental OOP principles by examining a complete Klondike Solitaire implementation - from simple Card objects to complex game mechanics.\n",
    "type: issues\n",
    "author: Risha, Anvay, Ruta, Vibha, Neil, Aadi\n",
    "comments: True\n",
    "sidebar_title: \"🎮 Solitaire Lessons\"\n",
    "lesson_links:\n",
    "  - { text: \"Lesson 1: Frontend\", url: \"/solitaire/lesson/frontend\" }\n",
    "  - { text: \"Lesson 2: OOP\", url: \"/solitaire/lesson/oop\" }\n",
    "  - { text: \"Lesson 3: Problem Solving\", url: \"/solitaire/lesson/problem-solving\" }\n",
    "  - { text: \"Lesson 4: LXD\", url: \"/solitaire/lesson/lxd\" }\n",
    "  - { text: \"End of Lesson Quiz\", url: \"/solitaire/lesson/quiz\" }\n",
    "  - { text: \"Future References\", url: \"/solitaire/lesson/future-references\" }\n",
    "\n",
    "enable_timer: true\n",
    "enable_progress: true\n",
    "progress_total: 6\n",
    "\n",
    "enable_badges: true\n",
    "lesson_key: \"oop\"\n",
    "lesson_badges:\n",
    " - \"oop\"\n",
    "enable_sandbox: true\n",
    "enable_quiz: true\n",
    "enable_ai_grading: true\n",
    "\n",
    "resources:\n",
    "  - { text: \"MDN: Classes\", url: \"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes\" }\n",
    "  - { text: \"JavaScript Info\", url: \"https://javascript.info\" }\n",
    "\n",
    "prev_url: \"/solitaire/lesson/frontend\"\n",
    "next_url: \"/solitaire/lesson/problem-solving\"\n",
    "permalink: /solitaire/lesson/oop\n",
    "---"
   ]
  },
  {
   "cell_type": "markdown",
   "id": "f4fe7908",
   "metadata": {},
   "source": [
    "# Object-Oriented Programming Through Solitaire\n",
    "\n",
    "Object-Oriented Programming (OOP) is one of the most common approaches to writing software. Instead of just writing functions and variables, we model our code around objects—entities that combine both data (properties) and behaviors (methods).\n",
    "\n",
    "This lesson will walk you through OOP using a Solitaire game as our example. By the end, you’ll see how the concepts of **encapsulation, abstraction, inheritance, and polymorphism** are not just theoretical ideas, but directly useful when building real software."
   ]
  },
  {
   "cell_type": "markdown",
   "id": "514e6564",
   "metadata": {},
   "source": [
    "## 1. Why OOP for Solitaire?\n",
    "\n",
    "Solitaire maps almost perfectly onto object-oriented programming. The way we think about **physical cards and piles** mirrors how we design **classes and objects** in code. The table below connects real-world Solitaire to the four pillars of OOP.\n",
    "\n",
    "| Solitaire Concept | How it Works in the Game | OOP Concept |\n",
    "| ----------------- | --------------------- | -------------------| \n",
    "| **Card** | Each card has a suit, rank, color, and a face-up/face-down state | **Encapsulation** – Each ```Card``` object holds its own data, instead of scattering those details across the program |\n",
    "| **Pile** (stock, waste, tableau, foundation) | Different piles follow different rules: tableau builds downward in alternating colors, foundations build upward in the same suit | **Inheritance & Polymorphism** – All piles share a base ```Pile``` class but override ```canAccept()``` with their own rules |\n",
    "| **Player’s Strategy** | The player thinks ahead, deciding which cards to move where | **Abstraction** – The ```Game``` class hides the complex rules of moving cards behind simple commands like ```tryMoveCardById()``` |\n",
    "| **Player’s Hands** (making moves) | The hands execute the chosen move: draw from stock, drag cards, place them | **Controller Object** – The ```Controller``` connects user input (mouse/keyboard) to the game logic |\n",
    "| **Overall Game** | Keeps track of score, timer, win conditions, and manages all piles | **Composition** – The ```Game``` class is built from smaller objects (Deck, Piles, Timer) |\n",
    "\n",
    "**tl;dr:** When we say Solitaire is a “natural fit for OOP,” we mean this:\n",
    "\n",
    "- Cards are objects\n",
    "- Piles inherit from a common base but specialize their rules\n",
    "- The Game provides abstraction, hiding complex steps behind simple actions\n",
    "- The Controller acts like the player’s hands, connecting ideas to actions\n",
    "\n",
    "OOP models the real world of Solitaire directly, which makes the code easier to understand and extend.\n",
    "\n",
    "Now, let's learn about how we implemented that into the functional game linked at /solitaire/."
   ]
  },
  {
   "cell_type": "markdown",
   "id": "031a2dbb",
   "metadata": {},
   "source": [
    "## 2. Core OOP Concepts\n",
    "\n",
    "Before we dive into Solitaire’s code, let’s review the key ideas behind OOP:\n",
    "\n",
    "| Pillar of OOP | Use Case |\n",
    "| --------------|-----------------|\n",
    "| Encapsulation | Grouping related data and methods together, while controlling how they can be accessed |\n",
    "| Abstraction | Hiding complex implementation details behind simple, clear interfaces |\n",
    "| Inheritance | Defining new classes that reuse and extend behavior from existing classes |\n",
    "| Polymorphism | Allowing different classes to respond to the same method call in their own way |\n",
    "\n",
    "**Benefits:**\n",
    "- Clearer structure\n",
    "- Easier to maintain and extend\n",
    "- Matches how we think about real-world problems\n",
    "\n",
    "**Drawbacks:**\n",
    "- Can be overcomplicated if misused\n",
    "- Sometimes slower to implement for very simple programs"
   ]
  },
  {
   "cell_type": "markdown",
   "id": "567676cd",
   "metadata": {},
   "source": [
    "## 5. Key Takeaways\n",
    "\n",
    "By modeling Solitaire with OOP, we created a **structured, modular, and maintainable game**.  \n",
    "Each OOP principle plays a clear role in keeping the code clean, flexible, and easy to extend:\n",
    "\n",
    "✅ Encapsulation keeps card data safe inside piles.\n",
    "✅ Abstraction makes game actions simple, even if the code behind them is complex.\n",
    "✅ Inheritance allows different pile types to share common behavior while adding their own rules.\n",
    "✅ Polymorphism lets the Game treat all piles the same, while each pile enforces its own rules.\n",
    "\n",
    "This is the power of OOP: turning a real-world system (like Solitaire) into clear, reusable code.\n",
    "\n",
    "**Next Up:** Complete hacks to solidify your understanding!"
   ]
  }
 ],
 "metadata": {
  "language_info": {
   "name": "python"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}
---

