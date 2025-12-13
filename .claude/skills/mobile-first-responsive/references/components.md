# Responsive Component Patterns

## Responsive Navbar

```html
<header class="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="text-xl font-bold">Brand</a>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-6">
        <a href="#" class="hover:text-blue-600 transition-colors">Home</a>
        <a href="#" class="hover:text-blue-600 transition-colors">About</a>
        <a href="#" class="hover:text-blue-600 transition-colors">Services</a>
        <a href="#" class="min-h-11 px-4 py-2 bg-blue-600 text-white rounded-lg
                          hover:bg-blue-700 transition-colors inline-flex items-center">
          Contact
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="menu-btn"
              class="md:hidden min-h-11 min-w-11 flex items-center justify-center
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-expanded="false" aria-controls="mobile-menu">
        <span class="sr-only">Open menu</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Navigation -->
    <div id="mobile-menu" class="hidden md:hidden pb-4">
      <div class="flex flex-col gap-2">
        <a href="#" class="min-h-11 px-4 py-2 rounded-lg hover:bg-gray-100
                          dark:hover:bg-gray-800 flex items-center">Home</a>
        <a href="#" class="min-h-11 px-4 py-2 rounded-lg hover:bg-gray-100
                          dark:hover:bg-gray-800 flex items-center">About</a>
        <a href="#" class="min-h-11 px-4 py-2 rounded-lg hover:bg-gray-100
                          dark:hover:bg-gray-800 flex items-center">Services</a>
        <a href="#" class="min-h-11 px-4 py-2 bg-blue-600 text-white rounded-lg
                          text-center">Contact</a>
      </div>
    </div>
  </nav>
</header>

<script>
const btn = document.getElementById('menu-btn');
const menu = document.getElementById('mobile-menu');
btn.addEventListener('click', () => {
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !expanded);
  menu.classList.toggle('hidden');
});
</script>
```

## Responsive Card Grid

```html
<section class="py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-2xl sm:text-3xl font-bold mb-8">Featured Items</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Card -->
      <article class="group bg-white dark:bg-gray-800 rounded-xl shadow-md
                      overflow-hidden hover:shadow-lg transition-shadow">
        <div class="aspect-video overflow-hidden">
          <img src="image.jpg" alt=""
               loading="lazy" decoding="async"
               class="w-full h-full object-cover
                      group-hover:scale-105 transition-transform duration-300">
        </div>
        <div class="p-4 sm:p-6">
          <h3 class="text-lg font-semibold mb-2">Card Title</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">
            Card description goes here with some details.
          </p>
          <a href="#" class="inline-flex items-center min-h-11 px-4 py-2
                            bg-blue-600 text-white rounded-lg
                            hover:bg-blue-700 transition-colors">
            Learn More
          </a>
        </div>
      </article>
    </div>
  </div>
</section>
```

## Responsive Form

```html
<form class="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
    <!-- Full width on mobile, half on tablet+ -->
    <div>
      <label for="fname" class="block text-sm font-medium mb-2">First Name</label>
      <input type="text" id="fname" name="fname"
             class="w-full min-h-11 px-4 py-2 rounded-lg border
                    border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>

    <div>
      <label for="lname" class="block text-sm font-medium mb-2">Last Name</label>
      <input type="text" id="lname" name="lname"
             class="w-full min-h-11 px-4 py-2 rounded-lg border
                    border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>

    <!-- Always full width -->
    <div class="sm:col-span-2">
      <label for="email" class="block text-sm font-medium mb-2">Email</label>
      <input type="email" id="email" name="email"
             class="w-full min-h-11 px-4 py-2 rounded-lg border
                    border-gray-300 dark:border-gray-600
                    bg-white dark:bg-gray-800
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    </div>

    <div class="sm:col-span-2">
      <label for="message" class="block text-sm font-medium mb-2">Message</label>
      <textarea id="message" name="message" rows="4"
                class="w-full px-4 py-3 rounded-lg border
                       border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       resize-y"></textarea>
    </div>

    <div class="sm:col-span-2">
      <button type="submit"
              class="w-full sm:w-auto min-h-11 px-8 py-3 bg-blue-600 text-white
                     rounded-lg font-medium hover:bg-blue-700
                     active:scale-[0.98] transition-all touch-manipulation">
        Send Message
      </button>
    </div>
  </div>
</form>
```

## Modal Dialog

```html
<!-- Trigger -->
<button id="modal-open"
        class="min-h-11 px-4 py-2 bg-blue-600 text-white rounded-lg">
  Open Modal
</button>

<!-- Modal -->
<div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"
     class="hidden fixed inset-0 z-50">
  <!-- Backdrop -->
  <div class="fixed inset-0 bg-black/50" id="modal-backdrop"></div>

  <!-- Content -->
  <div class="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2
              sm:max-w-lg sm:w-full
              bg-white dark:bg-gray-800 rounded-xl shadow-xl
              flex flex-col max-h-[calc(100vh-2rem)]">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b
                dark:border-gray-700">
      <h2 id="modal-title" class="text-lg font-semibold">Modal Title</h2>
      <button id="modal-close"
              class="min-h-11 min-w-11 flex items-center justify-center
                     rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
        <span class="sr-only">Close</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Body (scrollable) -->
    <div class="p-4 overflow-y-auto flex-1">
      <p>Modal content goes here.</p>
    </div>

    <!-- Footer -->
    <div class="p-4 border-t dark:border-gray-700 flex flex-col sm:flex-row
                gap-2 sm:justify-end">
      <button class="min-h-11 px-4 py-2 rounded-lg border
                     dark:border-gray-600 hover:bg-gray-100
                     dark:hover:bg-gray-700 order-2 sm:order-1">
        Cancel
      </button>
      <button class="min-h-11 px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 order-1 sm:order-2">
        Confirm
      </button>
    </div>
  </div>
</div>

<script>
const modal = document.getElementById('modal');
const openBtn = document.getElementById('modal-open');
const closeBtn = document.getElementById('modal-close');
const backdrop = document.getElementById('modal-backdrop');

const open = () => { modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
const close = () => { modal.classList.add('hidden'); document.body.style.overflow = ''; };

openBtn.addEventListener('click', open);
closeBtn.addEventListener('click', close);
backdrop.addEventListener('click', close);
modal.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
</script>
```

## Hero Section

```html
<section class="relative min-h-[50vh] sm:min-h-[60vh] lg:min-h-[80vh]
                flex items-center px-4 sm:px-6 lg:px-8">
  <!-- Background -->
  <div class="absolute inset-0 -z-10">
    <img src="hero-bg.jpg" alt=""
         class="w-full h-full object-cover"
         loading="eager" fetchpriority="high">
    <div class="absolute inset-0 bg-black/40"></div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto w-full">
    <div class="max-w-2xl text-white">
      <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
        Responsive Hero Headline
      </h1>
      <p class="text-lg sm:text-xl opacity-90 mb-6 sm:mb-8">
        A compelling description that adapts to different screen sizes.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a href="#" class="min-h-12 px-6 py-3 bg-white text-gray-900
                          rounded-lg font-semibold text-center
                          hover:bg-gray-100 transition-colors">
          Get Started
        </a>
        <a href="#" class="min-h-12 px-6 py-3 border-2 border-white
                          rounded-lg font-semibold text-center
                          hover:bg-white/10 transition-colors">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>
```
