<script>
  import ContactsList from './contacts-list.svelte';
  import Contact from './contact.svelte';
  export let setSidebarHTML;
  export let setContentHTML;

  export function init() {
   const sidebarDiv = document.createElement('div');
   new ContactsList({ target: sidebarDiv });
   setSidebarHTML(sidebarDiv.innerHTML);
   const contentDiv = document.createElement('div');
   new Contact({ target: contentDiv });
   setContentHTML(contentDiv.innerHTML);
  }
</script>