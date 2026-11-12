import { onBeforeUnmount, readonly, ref } from 'vue';

/** The screens of the app: the keyboard with its controls, and the menus. */
export type Page = 'main' | 'settings' | 'licenses';

/** Where the back arrow of a page goes. */
const PARENTS: Record<Page, Page> = {
  main: 'main',
  settings: 'main',
  licenses: 'settings',
};

/** The page the address bar is on; anything unknown is the main page. */
export function readPage(query: string): Page {
  const page = new URLSearchParams(query).get('page');
  return page === 'settings' || page === 'licenses' ? page : 'main';
}

/** The address of `page`, keeping the selection that is in the address now. */
function urlOf(page: Page): string {
  const params = new URLSearchParams(window.location.search);
  if (page === 'main') params.delete('page');
  else params.set('page', page);
  const query = params.toString();
  return query ? `?${query}` : window.location.pathname;
}

interface PageState {
  page: Page;
  /** The page it was opened from, so going back can use the browser's history. */
  from: Page;
}

function isPageState(state: unknown): state is PageState {
  return typeof state === 'object' && state !== null && 'from' in state;
}

/**
 * Which page is shown. The page is in the address bar, so a reload keeps it,
 * and every page opened is a step in the history, so the browser's back
 * button goes back.
 */
export function usePage() {
  const page = ref(readPage(window.location.search));

  const onPopState = () => {
    page.value = readPage(window.location.search);
  };
  window.addEventListener('popstate', onPopState);
  onBeforeUnmount(() => window.removeEventListener('popstate', onPopState));

  function open(next: Page) {
    const state: PageState = { page: next, from: page.value };
    window.history.pushState(state, '', urlOf(next));
    page.value = next;
  }

  function back() {
    const parent = PARENTS[page.value];
    const state: unknown = window.history.state;
    // Opened from its parent: step back in the history, like the browser does.
    if (isPageState(state) && state.from === parent) {
      window.history.back();
      return;
    }
    // Opened by a link or a reload: there is nothing to step back to.
    window.history.replaceState(null, '', urlOf(parent));
    page.value = parent;
  }

  return { page: readonly(page), open, back };
}
