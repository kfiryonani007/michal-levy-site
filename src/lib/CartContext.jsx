import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * ============================================================================
 *  CART — pieces a visitor is interested in, carried through to the WhatsApp
 *  message the contact form builds
 * ============================================================================
 *  Not a checkout cart (nothing is "bought" here — every piece is custom,
 *  made-to-order wall art). It's a shortlist: add a piece at a chosen size
 *  from the gallery lightbox, and by the time you reach the contact form the
 *  message already says exactly what you're interested in, so you don't have
 *  to type it out by hand.
 *
 *  Persisted to localStorage so it survives a page reload and carries across
 *  routes (gallery → home #contact) within the same browser.
 * ============================================================================
 */
const KEY = 'michal-site-cart';

function readCart() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* localStorage unavailable — the cart just won't persist across reloads */
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  const value = useMemo(() => {
    const keyOf = (itemId, sizeLabel) => `${itemId}::${sizeLabel}`;

    return {
      items,
      count: items.length,
      has: (itemId, sizeLabel) => items.some((i) => i.key === keyOf(itemId, sizeLabel)),
      add: (item) => {
        const key = keyOf(item.itemId, item.sizeLabel);
        setItems((list) => (list.some((i) => i.key === key) ? list : [...list, { ...item, key }]));
      },
      remove: (itemId, sizeLabel) => {
        const key = keyOf(itemId, sizeLabel);
        setItems((list) => list.filter((i) => i.key !== key));
      },
      toggle: (item) => {
        const key = keyOf(item.itemId, item.sizeLabel);
        setItems((list) =>
          list.some((i) => i.key === key)
            ? list.filter((i) => i.key !== key)
            : [...list, { ...item, key }]
        );
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
