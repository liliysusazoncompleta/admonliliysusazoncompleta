/**
 * @fileoverview Contexto del Carrito de Compras
 * @module client/src/hooks/useCart
 *
 * Permite agregar, modificar cantidades, quitar y vaciar productos
 * seleccionados. El estado se persiste en localStorage.
 */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'lili_carrito';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Restaurar carrito al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Persistir cambios
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /** Agrega un producto al carrito o incrementa su cantidad si ya existe. */
  const addItem = useCallback((producto, cantidad = 1) => {
    if (!producto?.id_producto) return;
    setItems(prev => {
      const idx = prev.findIndex(i => i.id_producto === producto.id_producto);
      if (idx >= 0) {
        const copia = [...prev];
        copia[idx] = { ...copia[idx], cantidad: copia[idx].cantidad + cantidad };
        return copia;
      }
      return [...prev, {
        id_producto:  producto.id_producto,
        codigo:       producto.codigo,
        nombre:       producto.nombre,
        tipo_nombre:  producto.tipo_nombre,
        presentacion: producto.presentacion,
        valor:        Number(producto.valor) || 0,
        imagen_url:   producto.imagen_url || '',
        cantidad,
      }];
    });
  }, []);

  /** Modifica la cantidad de un producto del carrito. */
  const setQuantity = useCallback((id_producto, cantidad) => {
    setItems(prev => prev.map(i =>
      i.id_producto === id_producto
        ? { ...i, cantidad: Math.max(1, Number(cantidad) || 1) }
        : i
    ));
  }, []);

  /** Incrementa o decrementa la cantidad de un producto. */
  const adjustQuantity = useCallback((id_producto, delta) => {
    setItems(prev => prev
      .map(i => i.id_producto === id_producto
        ? { ...i, cantidad: i.cantidad + delta }
        : i)
      .filter(i => i.cantidad > 0));
  }, []);

  /** Elimina un producto del carrito. */
  const removeItem = useCallback((id_producto) => {
    setItems(prev => prev.filter(i => i.id_producto !== id_producto));
  }, []);

  /** Vacía completamente el carrito. */
  const clearCart = useCallback(() => setItems([]), []);

  // Totales derivados
  const totalUnidades = useMemo(
    () => items.reduce((sum, i) => sum + i.cantidad, 0),
    [items]
  );
  const totalValor = useMemo(
    () => items.reduce((sum, i) => sum + i.cantidad * i.valor, 0),
    [items]
  );

  const value = {
    items,
    totalUnidades,
    totalValor,
    addItem,
    setQuantity,
    adjustQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/** Hook para consumir el contexto del carrito. */
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
};

export default CartContext;
