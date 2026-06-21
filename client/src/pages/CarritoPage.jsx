/**
 * @fileoverview Página del Carrito de Compras
 * @module client/src/pages/CarritoPage
 *
 * Lista los productos seleccionados, permite ajustar cantidades,
 * eliminar ítems y muestra el total. Sirve como paso previo a Ventas.
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import AppLayout from '../components/AppLayout.jsx';
import { useCart } from '../hooks/useCart.jsx';
import logoLili from '../assets/LOGO_LILI.jpg';
import api from '../lib/api.js';

const C = {
  primary:'#476500', primary2:'#5d7f13',
  surface:'#fafaed', container:'#eeefe2',
  white:'#ffffff',   text:'#1a1c15',
  textMuted:'#747967', textSub:'#444939',
  border:'#e2e3d6', orange:'#944a00',
  error:'#ba1a1a', errorBg:'#ffdad6',
};

// Imágenes placeholder por tipo (mismas que ProductosPage)
const IMG_BY_TYPE = {
  Arroz:       'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=75&fit=crop',
  Carne:       'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=75&fit=crop',
  Entradas:    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=75&fit=crop',
  Refrigerios: 'https://images.unsplash.com/photo-1504387432042-8aca549e4729?w=400&q=75&fit=crop',
  Sopas:       'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=75&fit=crop',
  Postres:     'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=75&fit=crop',
};
const getImg = (tipo, url) => url || IMG_BY_TYPE[tipo] || IMG_BY_TYPE.Carne;
const fmtPrecio = (v) => `$${Number(v).toLocaleString('es-CO')}`;
const fmtTime12h = (time) => {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return time;
  const minute = minuteStr || '00';
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
};
const EMPTY_CLIENT_FORM = {
  nombre: '', nit_cc: '', telefono: '', telefono_alt: '',
  direccion_principal: '', direccion_alterna: '', observaciones: '',
  valor_domicilio: 0,
};

//const api = axios.create({ baseURL: '/api' });
/*api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('lili_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});*/

export default function CarritoPage() {
  const navigate = useNavigate();
  const {
    items, totalUnidades, totalValor,
    adjustQuantity, setQuantity, removeItem, clearCart,
  } = useCart();
  const previewModalRef = useRef(null);
  const [search, setSearch] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [clientes, setClientes] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [commissionPercentage, setCommissionPercentage] = useState(0);
  const [clienteForm, setClienteForm] = useState(EMPTY_CLIENT_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [savingCliente, setSavingCliente] = useState(false);
  const [savingVenta, setSavingVenta] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [message, setMessage] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
  const [previewDocumentType, setPreviewDocumentType] = useState(null);

  const vacio = items.length === 0;

  const resetCheckout = () => {
    setQuery('');
    setClientes([]);
    setSelectedClient(null);
    setSelectedVendedor(null);
    setCommissionPercentage(0);
    setClienteForm(EMPTY_CLIENT_FORM);
    setFormErrors({});
    setDeliveryDate('');
    setDeliveryTime('');
    setMessage(null);
  };

  const handleOpenCheckout = () => {
    resetCheckout();
    setCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutOpen(false);
  };

  const handleVendedorChange = (id) => {
    setSelectedVendedor(id);
    const empleado = empleados.find(e => e.id_empleado === id);
    setCommissionPercentage(Number(empleado?.porcentaje_comision || 0));
  };

  const searchClientes = useCallback(async () => {
    if (!query.trim()) {
      setClientes([]);
      return;
    }
    setLoadingSearch(true);
    try {
      const { data } = await api.get('/clientes', { params: { q: query.trim() } });
      setClientes(data.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al buscar clientes.' });
    } finally {
      setLoadingSearch(false);
    }
  }, [query]);

  const handleSelectCliente = (cliente) => {
    setSelectedClient(cliente);
    // Auto-llenar el formulario con los datos del cliente
    setClienteForm({
      nombre: cliente.nombre || '',
      nit_cc: cliente.nit_cc || '',
      telefono: cliente.telefono || '',
      telefono_alt: cliente.telefono_alt || '',
      direccion_principal: cliente.direccion_principal || '',
      direccion_alterna: cliente.direccion_alterna || '',
      observaciones: cliente.observaciones || '',
      valor_domicilio: 0,
    });
    setMessage({ type: 'success', text: `Cliente seleccionado: ${cliente.nombre}` });
  };

  const setClienteField = (field, value) => {
    setClienteForm(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateClienteForm = () => {
    const errs = {};
    if (!clienteForm.nombre.trim()) errs.nombre = 'El nombre es requerido';
    if (!clienteForm.telefono.trim()) errs.telefono = 'El teléfono es requerido';
    if (!clienteForm.direccion_principal.trim()) errs.direccion_principal = 'La dirección principal es requerida';
    if (clienteForm.telefono.trim() && !/^\+?[0-9 \-]{6,20}$/.test(clienteForm.telefono.trim()))
      errs.telefono = 'Teléfono inválido';
    if (clienteForm.telefono_alt.trim() && !/^\+?[0-9 \-]{6,20}$/.test(clienteForm.telefono_alt.trim()))
      errs.telefono_alt = 'Teléfono alterno inválido';
    return errs;
  };

  const handleCreateCliente = async (e) => {
    e.preventDefault();
    const errs = validateClienteForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSavingCliente(true);
    try {
      const payload = {
        nombre: clienteForm.nombre.trim(),
        nit_cc: clienteForm.nit_cc.trim() || null,
        telefono: clienteForm.telefono.trim(),
        telefono_alt: clienteForm.telefono_alt.trim() || null,
        direccion_principal: clienteForm.direccion_principal.trim(),
        direccion_alterna: clienteForm.direccion_alterna.trim() || null,
        observaciones: clienteForm.observaciones.trim() || null,
      };
      const { data } = await api.post('/clientes', payload);
      setSelectedClient(data.data);
      setMessage({ type: 'success', text: 'Cliente creado y seleccionado correctamente.' });
      setClientes(prev => [data.data, ...prev]);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al crear cliente.' });
    } finally {
      setSavingCliente(false);
    }
  };

  const loadEmpleados = useCallback(async () => {
    try {
      const { data } = await api.get('/empleados');
      setEmpleados(data.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al cargar empleados.' });
    }
  }, []);

  useEffect(() => {
    if (checkoutOpen) loadEmpleados();
  }, [checkoutOpen, loadEmpleados]);

  const handleFinalizeSale = async () => {
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Selecciona o crea un cliente antes de continuar.' });
      return;
    }
    if (!selectedVendedor) {
      setMessage({ type: 'error', text: 'Selecciona un vendedor antes de finalizar la venta.' });
      return;
    }
    if (!deliveryDate || !deliveryTime) {
      setMessage({ type: 'error', text: 'Selecciona la fecha y la hora de entrega.' });
      return;
    }

    const totalConDomicilio = totalValor + (Number(clienteForm.valor_domicilio) || 0);
    const porcentajeComision = Number(commissionPercentage || 0);
    const valorComision = Math.round(totalValor * (porcentajeComision / 100) * 100) / 100;
    const payload = {
      id_cliente: selectedClient.id_cliente,
      id_empleado_comision: selectedVendedor,
      fecha_entrega: deliveryDate,
      valor_factura: totalConDomicilio,
      porcentaje_comision: porcentajeComision,
      valor_comision: valorComision,
      valor_domicilio: Number(clienteForm.valor_domicilio) || 0,
      observaciones: clienteForm.observaciones?.trim() || null,
    };

    setSavingVenta(true);
    try {
      const { data } = await api.post('/ventas', payload);
      const ventaId = data?.data?.id_venta;
      const vendedor = empleados.find(e => e.id_empleado === selectedVendedor);
      setMessage({
        type: 'success',
        text: `Venta guardada correctamente${ventaId ? ` (ID ${ventaId})` : ''}. Vendedor: ${vendedor?.nombre || ''}.`,
      });
     // setCheckoutOpen(false);
     // setPreviewOpen(false);
    } catch (error) {
      console.error('[SALE_SAVE_ERROR]', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error al guardar la venta en el servidor.',
      });
    } finally {
      setSavingVenta(false);
    }
  };

  const createPdfDocument = async () => {
  try {
    const element = previewModalRef.current;
    if (!element) {
      setMessage({ type: 'error', text: 'No se pudo capturar el documento.' });
      return null;
    }
    const contentDiv = element.querySelector('.invoice-pdf-content');
    if (!contentDiv) {
      setMessage({ type: 'error', text: 'Estructura de documento inválida.' });
      return null;
    }

    // ── Clonar en un contenedor off-screen a 780px fijo ──────────────
    const clone = contentDiv.cloneNode(true);
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'fixed', top: '-9999px', left: '-9999px',
      width: '780px', backgroundColor: '#ffffff',
      fontFamily: 'Manrope, Arial, sans-serif',
    });
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 2, logging: false, useCORS: true, allowTaint: true,
      width: 780, windowWidth: 780,
      backgroundColor: '#ffffff',
    });
    document.body.removeChild(wrapper);

    // ── Tamaño carta con márgenes estrechos ──────────────────────────
    const PAGE_W  = 216; // mm carta
    const PAGE_H  = 279;
    const MARGIN  = 6;   // márgenes estrechos
    const MAX_W   = PAGE_W - MARGIN * 2;
    const MAX_H   = PAGE_H - MARGIN * 2;

    const pdf = new jsPDF('p', 'mm', 'letter');

    // Escalar al ancho completo y verificar que no supere el alto
    const ratio   = canvas.height / canvas.width;
    let finalW    = MAX_W;
    let finalH    = MAX_W * ratio;

    if (finalH > MAX_H) {
      finalH = MAX_H;
      finalW = MAX_H / ratio;
    }

    const x = (PAGE_W - finalW) / 2;
    const y = MARGIN;

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalW, finalH);
    return pdf;

  } catch (error) {
    console.error('[PDF_ERROR]', error);
    setMessage({ type: 'error', text: `Error al generar PDF: ${error.message}` });
    return null;
  }
};

  const generatePDF = async (type) => {
    const pdf = await createPdfDocument();
    if (!pdf) return null;
    return pdf.output('dataurlstring');
  };

  const saveDocument = async () => {
    if (!selectedClient?.nombre) {
      setMessage({ type: 'error', text: 'Selecciona un cliente antes de guardar el documento.' });
      return;
    }

    const pdf = await createPdfDocument();
    if (!pdf) return;

    const now = new Date();
    const dateString = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
    const clientNameSlug = selectedClient.nombre
      .trim()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase() || 'cliente';
    const filename = `${clientNameSlug}_${dateString}.pdf`;

    const driveFolderUrl = 'https://drive.google.com/drive/folders/1EBHAc5wdxi478Xpdxv0I-OZuM0o3h3Cf';
    const popup = window.open(driveFolderUrl, '_blank');

    if (!popup) {
      setMessage({
        type: 'error',
        text: 'No se pudo abrir Drive. Habilita ventanas emergentes en tu navegador e inténtalo de nuevo.',
      });
      return;
    }

    popup.focus();
    const pdfBase64 = pdf.output('dataurlstring');

    try {
      pdf.save(filename);
      await api.post('/documents/upload', { filename, pdfBase64 });

      setMessage({
        type: 'success',
        text: `Documento descargado como ${filename} y se abrió la carpeta de Drive.`,
      });
    } catch (error) {
      console.error('[UPLOAD_DRIVE_ERROR]', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Error al guardar el documento en el servidor.',
      });
    }
  };

  const sendToWhatsApp = async (type) => {
    if (!selectedClient) {
      setMessage({ type: 'error', text: 'Selecciona un cliente primero.' });
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      setMessage({ type: 'error', text: 'Completa la fecha y hora de entrega.' });
      return;
    }

    setSendingWhatsapp(true);
    try {
      setTimeout(async () => {
        const pdfBase64 = await generatePDF(type);
        if (!pdfBase64) {
          setSendingWhatsapp(false);
          return;
        }

        try {
          const response = await api.post('/whatsapp/send', {
            clientPhone: selectedClient.telefono,
            clientName: selectedClient.nombre,
            pdfBase64,
            type,
          });

          if (response.data.success) {
            setMessage({
              type: 'success',
              text: `${type === 'invoice' ? 'Factura' : 'Cotización'} enviada exitosamente a WhatsApp`,
            });
          } else {
            setMessage({
              type: 'warning',
              text: response.data.message || 'Envío parcial a WhatsApp',
            });
          }
        } catch (error) {
          console.error(error);
          setMessage({
            type: 'error',
            text: error.response?.data?.error || 'Error al enviar por WhatsApp',
          });
        } finally {
          setSendingWhatsapp(false);
        }
      }, 300);
    } catch (error) {
      console.error(error);
      setSendingWhatsapp(false);
      setMessage({
        type: 'error',
        text: 'Error al procesar la solicitud',
      });
    }
  };

  return (
    <AppLayout activeKey="carrito" searchValue={search} onSearch={setSearch}>
      <div className="p-5 md:p-6 space-y-5">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="font-extrabold text-2xl md:text-3xl"
                style={{ color:C.text, letterSpacing:'-0.02em' }}>
              Carrito de Compras
            </h2>
            <p className="mt-1 text-sm font-medium" style={{ color:C.textMuted }}>
              Revisa los productos seleccionados antes de continuar con la venta.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/productos')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor:C.white, color:C.primary, border:`1.5px solid ${C.primary}` }}>
              ← Seguir comprando
            </button>
            {!vacio && (
              <button onClick={clearCart}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ backgroundColor:C.errorBg, color:C.error }}>
                🗑️ Vaciar carrito
              </button>
            )}
          </div>
        </div>

        {vacio ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl"
               style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
            <div className="text-5xl">🛒</div>
            <p className="font-bold text-lg" style={{ color:C.text }}>Tu carrito está vacío</p>
            <p className="text-sm font-medium" style={{ color:C.textMuted }}>
              Agrega productos desde el catálogo para verlos aquí.
            </p>
            <button onClick={() => navigate('/productos')}
              className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ backgroundColor:C.primary, color:C.white, boxShadow:'0 4px 14px rgba(71,101,0,0.35)' }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
              Ir al catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Lista de ítems */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <CartRow key={item.id_producto} item={item}
                  onInc={() => adjustQuantity(item.id_producto, +1)}
                  onDec={() => adjustQuantity(item.id_producto, -1)}
                  onChange={v => setQuantity(item.id_producto, v)}
                  onRemove={() => removeItem(item.id_producto)}/>
              ))}
            </div>

            {/* Resumen */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl p-5 sticky top-4"
                   style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
                <h3 className="font-extrabold text-lg mb-4" style={{ color:C.text }}>
                  Resumen del pedido
                </h3>

                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt style={{ color:C.textMuted }}>Productos</dt>
                    <dd className="font-semibold" style={{ color:C.text }}>{items.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt style={{ color:C.textMuted }}>Unidades totales</dt>
                    <dd className="font-semibold" style={{ color:C.text }}>{totalUnidades}</dd>
                  </div>
                </dl>

                <div className="my-4" style={{ borderTop:`1px solid ${C.border}` }}/>

                <div className="flex items-end justify-between mb-5">
                  <span className="text-sm font-bold" style={{ color:C.textSub }}>Total</span>
                  <span className="font-extrabold text-2xl"
                        style={{ color:C.primary, letterSpacing:'-0.02em' }}>
                    {fmtPrecio(totalValor)}
                  </span>
                </div>

                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{ backgroundColor:C.primary, color:C.white,
                           boxShadow:'0 4px 14px rgba(71,101,0.35)' }}
                  onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.primary2}
                  onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.primary}>
                  Continuar con la venta →
                </button>
                {message && (
                  <div className="mt-4 rounded-2xl px-4 py-3 text-sm font-medium"
                       style={{
                         backgroundColor: message.type === 'error' ? C.errorBg : '#eef6ee',
                         color: message.type === 'error' ? C.error : C.primary,
                         border: `1px solid ${message.type === 'error' ? '#f1b4b4' : '#b5d97a'}`,
                       }}>
                    {message.text}
                  </div>
                )}

                <p className="mt-3 text-xs text-center font-medium" style={{ color:C.textMuted }}>
                  El carrito se guarda automáticamente en este navegador.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
      {checkoutOpen && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={handleCloseCheckout}
          query={query}
          setQuery={setQuery}
          clientes={clientes}
          loadingSearch={loadingSearch}
          selectedClient={selectedClient}
          clienteForm={clienteForm}
          formErrors={formErrors}
          savingCliente={savingCliente}
          deliveryDate={deliveryDate}
          deliveryTime={deliveryTime}
          totalValor={totalValor}
          items={items}
          empleados={empleados}
          selectedVendedor={selectedVendedor}
          commissionPercentage={commissionPercentage}
          onCommissionPercentageChange={setCommissionPercentage}
          onVendedorChange={handleVendedorChange}
          onSearch={searchClientes}
          onSelectCliente={handleSelectCliente}
          onFieldChange={setClienteField}
          onDeliveryDateChange={setDeliveryDate}
          onDeliveryTimeChange={setDeliveryTime}
          onCreateCliente={handleCreateCliente}
          onFinalize={handleFinalizeSale}
          onReset={() => {
            setSelectedClient(null);
            setClienteForm(EMPTY_CLIENT_FORM);
            setFormErrors({});
            setMessage(null);
          }}
          message={message}
          savingVenta={savingVenta}
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          setPreviewDocumentType={setPreviewDocumentType}
          sendingWhatsapp={sendingWhatsapp}
        />
      )}

      {previewOpen && (
        <PreviewModal
          ref={previewModalRef}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          selectedClient={selectedClient}
          clienteForm={clienteForm}
          items={items}
          totalValor={totalValor}
          valorDomicilio={Number(clienteForm.valor_domicilio) || 0}
          deliveryDate={deliveryDate}
          deliveryTime={deliveryTime}
          documentType={previewDocumentType}
          onSend={sendToWhatsApp}
          onSave={saveDocument}
          onSaveSale={handleFinalizeSale}
          sendingWhatsapp={sendingWhatsapp}
          savingVenta={savingVenta}
          successMessage={message?.type === 'success' && message?.text?.includes('guardada') ? message.text : null}
          onDismissSuccess={() => setMessage(null)}
        />
      )}
    </AppLayout>
  );
}

function CheckoutModal({
  open, onClose, query, setQuery, clientes = [], loadingSearch,
  selectedClient, clienteForm, formErrors, savingCliente,
  deliveryDate, deliveryTime, totalValor, items = [],
  empleados = [], selectedVendedor, commissionPercentage, onCommissionPercentageChange, onVendedorChange,
  onSearch, onSelectCliente, onFieldChange,
  onDeliveryDateChange, onDeliveryTimeChange,
  onCreateCliente, onFinalize, onReset, message,
  savingVenta, previewOpen, setPreviewOpen, setPreviewDocumentType, sendingWhatsapp,
}) {
  if (!open) return null;
  const porcentajeComision = Number(commissionPercentage || 0);
  const valorComision = Math.round(totalValor * (porcentajeComision / 100) * 100) / 100;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor:'rgba(26,28,21,0.6)' }}>
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl bg-white"
           style={{ maxHeight:'92vh', overflowY:'auto' }}>
        <div className="flex flex-col lg:flex-row">
          <section className="w-full lg:w-1/2 p-6 border-b lg:border-b-0 lg:border-r"
                   style={{ borderColor:C.border }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl" style={{ color:C.text }}>Datos del cliente</h2>
                <p className="text-sm text-slate-500 mt-1">Busca por nombre o teléfono principal.</p>
              </div>
              <button onClick={() => { onClose(); onReset(); }}
                className="w-10 h-10 rounded-xl text-xl font-bold"
                style={{ color:C.textMuted }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}>
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 flex-col sm:flex-row">
                <input type="search" value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl border text-sm outline-none"
                  style={{ borderColor:C.border, backgroundColor:C.container }}
                  placeholder="Buscar cliente por nombre o teléfono" />
                <button type="button" onClick={onSearch}
                  className="px-4 py-3 rounded-2xl text-sm font-semibold"
                  style={{ backgroundColor:C.primary, color:C.white }}>
                  {loadingSearch ? 'Buscando…' : 'Buscar'}
                </button>
              </div>

              {message && (
                <div className="rounded-2xl px-4 py-3 text-sm font-medium"
                     style={{
                       backgroundColor: message.type === 'error' ? C.errorBg : '#eef6ee',
                       color: message.type === 'error' ? C.error : C.primary,
                       border: `1px solid ${message.type === 'error' ? '#f1b4b4' : '#b5d97a'}`,
                     }}>
                  {message.text}
                </div>
              )}

              {clientes.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color:C.text }}>Resultados encontrados</p>
                  <div className="grid gap-3">
                    {clientes.map(cliente => (
                      <button key={cliente.id_cliente}
                        type="button"
                        onClick={() => onSelectCliente(cliente)}
                        className="w-full rounded-2xl p-4 text-left transition-all"
                        style={{
                          backgroundColor: selectedClient?.id_cliente === cliente.id_cliente ? '#eef9f1' : C.surface,
                          border: `1px solid ${selectedClient?.id_cliente === cliente.id_cliente ? C.primary : C.border}`,
                        }}>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold" style={{ color:C.text }}>{cliente.nombre}</p>
                            <p className="text-xs text-slate-500">{cliente.telefono}</p>
                          </div>
                          <span className="text-xs font-semibold" style={{ color:C.primary }}>Seleccionar</span>
                        </div>
                        <p className="text-xs mt-2" style={{ color:C.textMuted }}>
                          {cliente.direccion_principal}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-4"
                     style={{ borderColor:C.border, backgroundColor:C.surface }}>
                  <p className="text-sm text-slate-600">
                    No se encontraron clientes para esa búsqueda. Crea uno nuevo con el formulario de la derecha.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="w-full lg:w-1/2 p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-extrabold text-xl" style={{ color:C.text }}>Cliente y entrega</h2>
                <p className="text-sm text-slate-500 mt-1">Selecciona un cliente o registra uno nuevo.</p>
              </div>
            </div>

            {selectedClient && (
              <div className="rounded-3xl border p-4 mb-5" style={{ borderColor:C.border, backgroundColor:'#f5f9f5' }}>
                <p className="text-sm font-semibold" style={{ color:C.text }}>Cliente seleccionado</p>
                <p className="mt-2 font-bold" style={{ color:C.primary }}>{selectedClient.nombre}</p>
                <p className="text-sm" style={{ color:C.textMuted }}>{selectedClient.telefono}</p>
                <p className="text-sm mt-2" style={{ color:C.textMuted }}>{selectedClient.direccion_principal}</p>
              </div>
            )}

            <form onSubmit={onCreateCliente} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Nombre *</label>
                  <input value={clienteForm.nombre}
                    onChange={e => onFieldChange('nombre', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor: formErrors.nombre ? C.error : C.border, backgroundColor:C.container }}
                    placeholder="Ej: María Pérez González" />
                  {formErrors.nombre && <p className="text-xs text-red-600">{formErrors.nombre}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Teléfono principal *</label>
                  <input value={clienteForm.telefono}
                    onChange={e => onFieldChange('telefono', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor: formErrors.telefono ? C.error : C.border, backgroundColor:C.container }}
                    placeholder="Ej: 3001234567" />
                  {formErrors.telefono && <p className="text-xs text-red-600">{formErrors.telefono}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Dirección principal *</label>
                  <input value={clienteForm.direccion_principal}
                    onChange={e => onFieldChange('direccion_principal', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor: formErrors.direccion_principal ? C.error : C.border, backgroundColor:C.container }}
                    placeholder="Calle, barrio, ciudad" />
                  {formErrors.direccion_principal && <p className="text-xs text-red-600">{formErrors.direccion_principal}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Teléfono alterno</label>
                  <input value={clienteForm.telefono_alt}
                    onChange={e => onFieldChange('telefono_alt', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor: formErrors.telefono_alt ? C.error : C.border, backgroundColor:C.container }}
                    placeholder="Opcional" />
                  {formErrors.telefono_alt && <p className="text-xs text-red-600">{formErrors.telefono_alt}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">NIT / CC</label>
                  <input value={clienteForm.nit_cc}
                    onChange={e => onFieldChange('nit_cc', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor:C.border, backgroundColor:C.container }}
                    placeholder="Opcional" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Dirección alterna</label>
                  <input value={clienteForm.direccion_alterna}
                    onChange={e => onFieldChange('direccion_alterna', e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor:C.border, backgroundColor:C.container }}
                    placeholder="Opcional" />
                </div>
              </div>

              <div className="rounded-3xl border border-dashed p-4" style={{ borderColor:C.border, backgroundColor:'#f8faf4' }}>
                <p className="text-xs font-bold uppercase mb-3" style={{ color:C.textSub }}>Vendedor</p>
                {empleados.length === 0 ? (
                  <p className="text-sm text-slate-500">Cargando vendedores...</p>
                ) : (
                  <>
                    <select
                      value={selectedVendedor || ''}
                      onChange={e => onVendedorChange(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                      style={{ borderColor:C.border, backgroundColor:C.container }}
                    >
                      <option value="" disabled>Selecciona un vendedor</option>
                      {empleados.map((empleado) => (
                        <option key={empleado.id_empleado} value={empleado.id_empleado}>
                          {empleado.nombre}
                        </option>
                      ))}
                    </select>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Porcentaje de comisión</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step="0.1"
                          value={commissionPercentage}
                          onChange={e => onCommissionPercentageChange(Number(e.target.value || 0))}
                          className="w-full px-4 py-3 rounded-2xl border text-sm bg-white outline-none"
                          style={{ borderColor:C.border, color:C.text }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500">Valor de la comisión</label>
                        <input value={fmtPrecio(valorComision)} readOnly
                          className="w-full px-4 py-3 rounded-2xl border text-sm bg-slate-100 outline-none"
                          style={{ borderColor:C.border, color:C.text }} />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">El vendedor se guarda como metadato de la venta y no aparecerá en el PDF.</p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">Observaciones</label>
                <textarea value={clienteForm.observaciones}
                  onChange={e => onFieldChange('observaciones', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl border text-sm outline-none resize-none"
                  style={{ borderColor:C.border, backgroundColor:C.container }}
                  placeholder="Notas o preferencias del cliente" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Fecha de entrega *</label>
                  <input type="date" value={deliveryDate}
                    onChange={e => onDeliveryDateChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor:C.border, backgroundColor:C.container }} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500">Hora de entrega *</label>
                  <input type="time" value={deliveryTime}
                    onChange={e => onDeliveryTimeChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border text-sm outline-none"
                    style={{ borderColor:C.border, backgroundColor:C.container }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500">Valor del domicilio</label>
                <div className="flex items-center rounded-2xl overflow-hidden border"
                     style={{ borderColor:C.border }}>
                  <span className="px-4 py-3 font-bold text-sm" style={{ color:C.primary }}>$</span>
                  <input type="number" value={clienteForm.valor_domicilio} min={0}
                    onChange={e => onFieldChange('valor_domicilio', e.target.value)}
                    className="flex-1 px-2 py-3 bg-transparent outline-none text-sm"
                    style={{ color:C.text }}
                    placeholder="0" />
                </div>
              </div>

              {/* Resumen de totales */}
              {selectedClient && (
                <div className="rounded-2xl border p-4 bg-slate-50">
                  <p className="text-xs font-bold uppercase" style={{ color:C.textSub }}>Resumen de venta</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt style={{ color:C.textMuted }}>Subtotal productos</dt>
                      <dd className="font-semibold" style={{ color:C.text }}>{fmtPrecio(totalValor)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt style={{ color:C.textMuted }}>Domicilio</dt>
                      <dd className="font-semibold" style={{ color:C.text }}>{fmtPrecio(Number(clienteForm.valor_domicilio) || 0)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 pt-3 border-t flex items-end justify-between" style={{ borderColor:C.border }}>
                    <span className="text-sm font-bold" style={{ color:C.textSub }}>Total</span>
                    <span className="font-extrabold text-lg" style={{ color:C.primary }}>
                      {fmtPrecio(totalValor + (Number(clienteForm.valor_domicilio) || 0))}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={() => { setPreviewDocumentType('invoice'); setPreviewOpen(true); }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{ backgroundColor:C.container, color:C.primary, border:`1px solid ${C.border}` }}>
                    👁️ Vista previa
                  </button>
                  <button type="button"
                    onClick={() => { setPreviewDocumentType('quotation'); setPreviewOpen(true); }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{ backgroundColor:'#25D366', color:C.white }}>
                    💬 Cotizar
                  </button>
                  <button type="button"
                    onClick={() => { setPreviewDocumentType('invoice'); setPreviewOpen(true); }}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{ backgroundColor:'#0B7EDB', color:C.white }}>
                    🧾 Facturar
                  </button>
                </div>
                <button type="submit" disabled={savingCliente}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ backgroundColor:C.primary, color:C.white }}>
                  {savingCliente ? 'Creando cliente…' : 'Crear cliente'}
                </button>
                <button type="button" onClick={() => { onFinalize(); onClose(); }}
                  disabled={savingVenta}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ backgroundColor:'#444939', color:C.white }}>
                  {savingVenta ? 'Guardando venta…' : '✅ Finalizar venta'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── MODAL: VISTA PREVIA DE FACTURA ────────────────────────────────────────────
//const PreviewModal = React.forwardRef(({ open, onClose, selectedClient, clienteForm = {}, items, totalValor, valorDomicilio, deliveryDate, deliveryTime, documentType, onSend, onSave, onSaveSale, sendingWhatsapp, savingVenta }, ref) => {
  const PreviewModal = React.forwardRef(({ open, onClose, selectedClient, clienteForm = {}, items, totalValor, valorDomicilio, deliveryDate, deliveryTime, documentType, onSend, onSave, onSaveSale, sendingWhatsapp, savingVenta, successMessage, onDismissSuccess }, ref) => {
  if (!open) return null;
  const previewClient = { ...(selectedClient || {}), ...clienteForm };
  const totalFinal = totalValor + valorDomicilio;
  const label = documentType === 'quotation' ? 'COTIZACIÓN' : 'FACTURA';

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(26,28,21,0.6)' }}>
      <div ref={ref}
           className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl bg-white"
           style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="invoice-pdf-content" style={{
  width: '100%', maxWidth: 780, margin: '0 auto',
  backgroundColor: '#fff', fontFamily: 'Manrope, Arial, sans-serif',
  fontSize: items.length > 10 ? '9px' : items.length > 6 ? '11px' : '13px',
}}>

{/* ENCABEZADO */}
<div style={{ backgroundColor:'#fff', padding:'12px 16px',
              borderBottom:`3px solid ${C.primary}` }}>
  <div style={{ display:'flex', alignItems:'center', gap:14 }}>

    {/* Logo */}
    <img src={logoLili} alt="Logo"
         style={{ width:70, height:70, borderRadius:10, objectFit:'cover', flexShrink:0 }}/>

    {/* Info empresa + título */}
    <div style={{ flex:1, textAlign:'center' }}>

      {/* Título FACTURA / COTIZACIÓN */}
      <p style={{
        color: '#c00000', fontWeight:900, fontSize:'1.6em',
        margin:'0 0 4px', letterSpacing:2, textTransform:'uppercase',
      }}>
        {documentType === 'quotation' ? 'COTIZACIÓN' : 'FACTURA'}
      </p>

      {/* Info empresa */}
      <p style={{ fontWeight:800, fontSize:'0.85em', color:'#1a1c15', margin:'2px 0' }}>
        LILI Y SU SAZÓN COMPLETA <br/>
        Nit. 43.089.544-4 &nbsp; RÉGIMEN SIMPLIFICADO
      </p>
      <p style={{ fontWeight:800, fontSize:'0.82em', color:'#1a1c15', margin:'2px 0' }}>
        Tels: (604) 5955045 &nbsp;-&nbsp; (+57) 3177719249
      </p>
      <p style={{ fontWeight:800, fontSize:'0.82em', color:'#1a1c15', margin:'2px 0' }}>
         Medellín - Ant.
      </p>
    </div>

    {/* Fechas */}
    <div style={{ textAlign:'right', fontSize:'0.78em', lineHeight:1.9, flexShrink:0 }}>
      <p style={{ margin:0 }}>
        <strong style={{ display:'block', fontSize:'1.05em', color:'#1a1c15' }}>Fecha de Elaboración</strong>
        <span style={{ color:'#444939' }}>{new Date().toLocaleDateString('es-CO')}</span>
      </p>
      <p style={{ margin:'4px 0 0' }}>
        <strong style={{ display:'block', fontSize:'1.05em', color:'#1a1c15' }}>Fecha de Entrega</strong>
        <span style={{ color:'#444939' }}>{deliveryDate}</span>
      </p>
      <p style={{ margin:'4px 0 0' }}>
        <strong style={{ display:'block', fontSize:'1.05em', color:'#1a1c15' }}>Hora de Entrega</strong>
        <span style={{ color:'#444939' }}>{fmtTime12h(deliveryTime)}</span>
      </p>
    </div>

  </div>
</div>

  {/* DATOS CLIENTE + PAGO */}
  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'10px 16px' }}>

    {/* Cliente */}
    <div style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', backgroundColor:'#f7faf3' }}>
      <p style={{ fontSize:'0.7em', fontWeight:700, textTransform:'uppercase', color:C.textSub, margin:'0 0 4px' }}>
        DATOS DEL CLIENTE
      </p>
      <p style={{ fontWeight:700, color:C.text, margin:'0 0 2px', fontSize:'1em' }}>
        {previewClient?.nombre || ''}
      </p>
      {previewClient?.nit_cc && (
        <p style={{ color:C.textMuted, margin:'1px 0', fontSize:'0.85em' }}>CC/NIT: {previewClient.nit_cc}</p>
      )}
      {previewClient?.telefono && (
        <p style={{ color:C.textMuted, margin:'1px 0', fontSize:'0.85em' }}>📞 {previewClient.telefono}</p>
      )}
      {previewClient?.telefono_alt && (
        <p style={{ color:C.textMuted, margin:'1px 0', fontSize:'0.85em' }}>📞 Alt: {previewClient.telefono_alt}</p>
      )}
      {previewClient?.direccion_principal && (
        <p style={{ color:C.textMuted, margin:'1px 0', fontSize:'0.85em' }}>📍 {previewClient.direccion_principal}</p>
      )}
      {previewClient?.observaciones && (
        <p style={{ color:C.text, margin:'4px 0 0', fontSize:'0.82em', fontStyle:'italic' }}>
          Obs: {previewClient.observaciones}
        </p>
      )}
    </div>

    {/* Pago */}
    <div style={{ border:`1px solid ${C.border}`, borderRadius:8, padding:'8px 10px', backgroundColor:'#eff8f6' }}>
      <p style={{ fontSize:'0.7em', fontWeight:700, textTransform:'uppercase', color:C.primary, margin:'0 0 4px' }}>
        INFORMACIÓN PARA EL PAGO
      </p>
      <p style={{ fontSize:'0.85em', color:C.text, margin:'2px 0', lineHeight:1.5 }}>
        <strong>Cuenta de Ahorros Bancolombia</strong><br/>
        Número: <strong>25300003634</strong><br/>
        A nombre de: CRUZ MARIA VALENCIA<br/>
        CC. 43089544
      </p>
      <p style={{ fontSize:'0.78em', color:C.primary, margin:'6px 0 0', fontWeight:600 }}>
        Transfiere el 50% para confirmar tu pedido
      </p>
    </div>
  </div>

  {/* TABLA DE PRODUCTOS */}
  <div style={{ padding:'0 16px 8px' }}>
    <p style={{ fontSize:'0.7em', fontWeight:700, textTransform:'uppercase', color:C.textSub, margin:'0 0 4px' }}>
      DETALLE DE PRODUCTOS
    </p>
    <table style={{ width:'100%', borderCollapse:'collapse' }}>
      <thead>
  <tr style={{ borderBottom:`2px solid ${C.border}`, backgroundColor:'#f4f5e7' }}>
    <th style={{ textAlign:'center', padding:'5px 6px', fontWeight:700, color:C.textSub, fontSize:'0.85em', width:30 }}>
      ITEM
    </th>
    <th style={{ textAlign:'left', padding:'5px 6px', fontWeight:700, color:C.textSub, fontSize:'0.85em' }}>
      DESCRIPCIÓN
    </th>
    <th style={{ textAlign:'center', padding:'5px 6px', fontWeight:700, color:C.textSub, fontSize:'0.85em', width:40 }}>
      Cant.
    </th>
    <th style={{ textAlign:'right', padding:'5px 6px', fontWeight:700, color:C.textSub, fontSize:'0.85em', width:80 }}>
      V. Unit.
    </th>
    <th style={{ textAlign:'right', padding:'5px 6px', fontWeight:700, color:C.textSub, fontSize:'0.85em', width:80 }}>
      Total
    </th>
  </tr>
</thead>
      <tbody>
  {items.map((item, idx) => (
    <tr key={item.id_producto}
        style={{ borderBottom:`1px solid ${C.border}`,
                 backgroundColor: idx % 2 === 0 ? '#fff' : '#fafaed' }}>
      <td style={{ padding:'4px 6px', color:C.primary, textAlign:'center',
                   fontWeight:800, fontSize:'0.9em' }}>
        {idx + 1}
      </td>
      <td style={{ padding:'4px 6px', color:C.text, fontSize:'0.9em' }}>{item.nombre}</td>
      <td style={{ padding:'4px 6px', color:C.text, textAlign:'center', fontSize:'0.9em' }}>{item.cantidad}</td>
      <td style={{ padding:'4px 6px', color:C.text, textAlign:'right', fontSize:'0.9em' }}>{fmtPrecio(item.valor)}</td>
      <td style={{ padding:'4px 6px', color:C.primary, textAlign:'right', fontWeight:700, fontSize:'0.9em' }}>
        {fmtPrecio(item.cantidad * item.valor)}
      </td>
    </tr>
  ))}
</tbody>
    </table>
  </div>

  {/* TOTALES */}
  <div style={{ padding:'0 16px 8px', display:'flex', justifyContent:'flex-end' }}>
    <div style={{ width:220 }}>
      <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0',
                    fontSize:'0.88em', color:C.textMuted }}>
        <span>Subtotal</span><span style={{ color:C.text }}>{fmtPrecio(totalValor)}</span>
      </div>
      {valorDomicilio > 0 && (
        <div style={{ display:'flex', justifyContent:'space-between', padding:'3px 0',
                      fontSize:'0.88em', color:C.textMuted }}>
          <span>Domicilio</span><span style={{ color:C.text }}>{fmtPrecio(valorDomicilio)}</span>
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', padding:'6px 0',
                    borderTop:`2px solid ${C.primary}`, marginTop:4,
                    fontSize:'1.05em', fontWeight:800 }}>
        <span style={{ color:C.textSub }}>TOTAL</span>
        <span style={{ color:C.primary }}>{fmtPrecio(totalFinal)}</span>
      </div>
    </div>
  </div>

  {/* PIE DE PÁGINA */}
  <div style={{ margin:'0 16px 12px', borderRadius:8, padding:'10px 14px',
                background:`linear-gradient(135deg,${C.primary},${C.primary2})` }}>
    <p style={{ color:'#fff', fontWeight:800, fontSize:'0.9em', margin:'0 0 4px', textAlign:'center' }}>
      🍽️ ¡Gracias por tu compra!
    </p>
    <p style={{ color:'rgba(255,255,255,0.9)', fontSize:'0.78em', margin:0, textAlign:'center', lineHeight:1.6 }}>
      Envía tu comprobante de pago por WhatsApp al <strong>+57 3177719249</strong> para confirmar tu pedido
    </p>
    <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:6 }}>
      <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.75em', margin:0 }}>
        📸 Instagram: <strong>@liliysusazoncompleta</strong>
      </p>
      <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'0.75em', margin:0 }}>
        💬 WhatsApp: <strong>+57 3177719249</strong>
      </p>
    </div>
    <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.7em', margin:'4px 0 0', textAlign:'center' }}>
      Calle 112 # 51A-15 · Medellín, Antioquia · Colombia
    </p>
  </div>

</div>

              {/* ✅ Popup de confirmación al guardar venta */}
{successMessage && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center"
       style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h3 className="font-extrabold text-lg mb-2" style={{ color: C.text }}>
        Factura guardada
      </h3>
      <p className="text-sm mb-6" style={{ color: C.textMuted }}>{successMessage}</p>
      <button onClick={onDismissSuccess}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white"
        style={{ backgroundColor: C.primary }}>
        Aceptar
      </button>
    </div>
  </div>
)}

        <div className="p-8 bg-white">
          <div className="flex gap-3 pt-4 flex-col sm:flex-row">
            <button onClick={onClose}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: C.container, color: C.textSub }}>
              Cerrar
            </button>
            <button type="button" onClick={() => onSend(documentType)}
                    disabled={sendingWhatsapp}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#25D366', color: C.white }}>
              {sendingWhatsapp ? '⏳ Enviando…' : 'Enviar a WhatsApp'}
            </button>
            <button type="button" onClick={onSaveSale}
                    disabled={savingVenta}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ backgroundColor: '#22C55E', color: C.white }}>
              {savingVenta ? 'Guardando venta…' : 'Guardar Venta'}
            </button>
            <button type="button" onClick={onSave}
                    className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                    style={{ backgroundColor: '#0B7EDB', color: C.white }}>
              Facturar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PreviewModal.displayName = 'PreviewModal';

// ── Fila de carrito ──────────────────────────────────────────────────────────
function CartRow({ item, onInc, onDec, onChange, onRemove }) {
  const subtotal = item.cantidad * item.valor;
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl"
         style={{ backgroundColor:C.white, border:`1px solid ${C.border}` }}>
      <img src={getImg(item.tipo_nombre, item.imagen_url)}
           alt={item.nombre}
           className="w-full sm:w-28 h-28 object-cover rounded-xl flex-shrink-0"/>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold" style={{ color:C.textMuted }}>{item.codigo}</p>
            <h4 className="font-extrabold text-base leading-snug truncate"
                style={{ color:C.text }}>
              {item.nombre}
            </h4>
            <p className="text-xs font-medium mt-0.5" style={{ color:C.textSub }}>
              {item.tipo_nombre} · {item.presentacion}
            </p>
          </div>
          <button type="button" onClick={onRemove}
            className="px-2 py-1 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
            style={{ backgroundColor:'transparent', color:C.error }}
            onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.errorBg}
            onMouseLeave={e=>e.currentTarget.style.backgroundColor='transparent'}
            title="Quitar del carrito">
            🗑️
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between flex-wrap gap-3">
          {/* Selector de cantidad */}
          <div className="flex items-center gap-1 rounded-lg overflow-hidden"
               style={{ border:`1.5px solid ${C.border}` }}>
            <button type="button" onClick={onDec}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors"
              style={{ color:C.primary, backgroundColor:C.white }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.white}>
              −
            </button>
            <input type="number" min={1} value={item.cantidad}
              onChange={e => onChange(e.target.value)}
              className="w-10 text-center text-sm font-bold outline-none"
              style={{ color:C.text, backgroundColor:C.white }}/>
            <button type="button" onClick={onInc}
              className="w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors"
              style={{ color:C.primary, backgroundColor:C.white }}
              onMouseEnter={e=>e.currentTarget.style.backgroundColor=C.container}
              onMouseLeave={e=>e.currentTarget.style.backgroundColor=C.white}>
              +
            </button>
          </div>

          {/* Precios */}
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color:C.textMuted }}>
              {fmtPrecio(item.valor)} × {item.cantidad}
            </p>
            <p className="font-extrabold text-lg" style={{ color:C.primary }}>
              {fmtPrecio(subtotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
