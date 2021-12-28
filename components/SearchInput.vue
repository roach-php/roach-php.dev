<template>
  <div class="w-64 relative">
    <div class="absolute left-4 inset-y-0 flex items-center justify-center">
      <svg
        class="w-4 h-4 text-gray-500 fill-current"
        viewBox="0 0 20 20"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
      >
        <path
          d="M12.9056439,14.3198574 C11.5509601,15.3729184 9.84871145,16 8,16 C3.581722,16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 C12.418278,0 16,3.581722 16,8 C16,9.84871145 15.3729184,11.5509601 14.3198574,12.9056439 L19.6568542,18.2426407 L18.2426407,19.6568542 L12.9056439,14.3198574 Z M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z"
          id="Combined-Shape"
        ></path>
      </svg>
    </div>

    <input
      type="text"
      class="hidden lg:block rounded-full w-full pl-10 pr-4 py-2 bg-gray-50 disabled:bg-gray-200 ring-1 ring-gray-200 disabled:ring-gray-300 focus:ring-cyan-500 text-gray-800 outline-none focus:outline-none"
      placeholder="Search coming soon(tm)"
      disabled
    />
  </div>
</template>
