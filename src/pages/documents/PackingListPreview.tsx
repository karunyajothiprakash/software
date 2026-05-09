import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PackingListPreview() {
  const { id } = useParams();
  const [shipment, setShipment] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try fetching as a Shipment first
        let { data, error: fetchErr } = await supabase
          .from("export_shipments")
          .select("*, export_orders(*), export_containers(*)")
          .eq("id", id)
          .single();

        if (fetchErr) {
          // If not found, try fetching as an Order directly
          const { data: orderOnly, error: orderErr } = await supabase
            .from("export_orders")
            .select("*, export_shipments(*)")
            .eq("id", id)
            .single();

          if (orderErr) throw orderErr;
          
          const shipmentData = orderOnly.export_shipments?.[0] || {
            origin_port: 'TBD',
            destination_port: 'TBD',
            departure_date: null
          };
          
          setShipment({
            ...shipmentData,
            customer_name: orderOnly.customer_name,
            export_orders: orderOnly,
            export_containers: []
          });
          data = { export_orders: orderOnly };
        } else {
          setShipment(data);
        }

        const orderData = Array.isArray(data.export_orders) ? data.export_orders[0] : data.export_orders;
        
        if (orderData?.company_id) {
          const { data: compData } = await supabase
            .from("companies")
            .select("signature_url")
            .eq("id", orderData.company_id)
            .single();
          setCompany(compData);
        }
        
        if (orderData?.created_by) {
          const { data: userData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", orderData.created_by)
            .single();
          if (userData) {
            orderData.creator_name = userData.full_name;
          }
        }
      } catch (err: any) {
        console.error("Report load error:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PackingList-${shipment.shipment_number || 'download'}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <div style={{ background: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );

  if (error || !shipment) return (
    <div style={{ color: 'red', padding: '40px', background: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Failed to load packing list.</h2>
      <p>ID: {id}</p>
      <pre style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5', color: '#d32f2f' }}>{error}</pre>
    </div>
  );

  const order = Array.isArray(shipment.export_orders) 
    ? (shipment.export_orders[0] || {}) 
    : (shipment.export_orders || {});
    
  const containers = shipment.export_containers || [];
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div style={{ background: '#f5f5f5', color: 'black', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }} className="flex flex-col items-center">
      
      <div className="mb-6 w-full max-w-[210mm] flex justify-end px-2">
        <Button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className="bg-[#1A5276] hover:bg-[#154360] text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          SAVE AS PDF
        </Button>
      </div>

      <div ref={invoiceRef} className="relative w-full max-w-[210mm] shadow-xl">
        <div className="bg-white text-black min-h-[297mm] flex flex-col relative border-[2px] border-black box-border">
          
          {/* Watermark */}
          <div className="absolute top-[30%] left-[20%] right-[20%] bottom-[30%] z-0 flex items-center justify-center opacity-10 pointer-events-none">
            <img src="/logo.webp" alt="Watermark" className="w-full h-auto object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>

          <div className="relative z-10 flex flex-col flex-1">
            
            <div className="grid grid-cols-2 border-b-[2px] border-black min-h-[160px] bg-transparent">
              <div className="p-6 border-r-[2px] border-black flex flex-col justify-start">
                <h1 className="font-bold text-[14px] text-[#1A5276] mb-6 whitespace-nowrap overflow-visible leading-tight">SHASTIKA GLOBAL IMPEX PRIVATE LIMITED</h1>
                <div className="flex items-start gap-4">
                  <img src="/logo.webp" alt="Logo" className="w-16 h-16 object-contain" />
                  <div className="text-[9px] leading-relaxed text-gray-700">
                    <p className="font-bold uppercase mb-1">Regd Office:</p>
                    <p>Flat No: S2, II Floor, Door No. 13/2,</p>
                    <p>Vannier Street, Choolaimedu,</p>
                    <p>Chennai, Tamil Nadu, India - 600094</p>
                    <p className="mt-2 font-bold uppercase mb-1">Corporate Office:</p>
                    <p>New No. 11, Old No. 6, Plot No. 13,</p>
                    <p>IInd Street, Lakshmi Nagar, Nanganallur,</p>
                    <p>Chennai, Tamil Nadu, India - 600061</p>
                    <p className="mt-1">Email: shastikaglobalimpex@gmail.com</p>
                    <p>Web: www.shastikaglobal.com</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col uppercase font-bold">
                <div className="bg-[#BDD7EE] p-3 text-center border-b-[2px] border-black text-[16px] tracking-widest text-[#1A5276]">
                  PACKING LIST
                </div>
                <div className="grid grid-cols-2 flex-1 text-[10px]">
                  <div className="border-r-[1px] border-black p-3 space-y-4">
                    <div>
                      <p className="text-gray-500 mb-1">PL NO.</p>
                      <p className="text-[12px]">PL-{shipment.shipment_number?.slice(4) || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">DATE</p>
                      <p>{today}</p>
                    </div>
                  </div>
                  <div className="p-3 space-y-4">
                    <div>
                      <p className="text-gray-500 mb-1">ORDER NO.</p>
                      <p>{order.order_number || '---'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">COUNTRY OF ORIGIN</p>
                      <p>INDIA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 border-b-[2px] border-black text-[10px] min-h-[140px] bg-transparent">
              <div className="p-4 border-r-[2px] border-black bg-transparent">
                <p className="text-gray-500 font-bold mb-2 uppercase tracking-wider text-[9px]">Consignee / Bill To:</p>
                <div className="font-bold text-[11px] mb-2">{shipment.customer_name}</div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {order.shipping_address || 'Address details as per order contract'}
                  {order.customer_country && <p className="mt-1 font-bold">{order.customer_country}</p>}
                </div>
              </div>
              <div className="p-4 bg-transparent">
                <p className="text-gray-500 font-bold mb-2 uppercase tracking-wider text-[9px]">Ship To / Notify Party:</p>
                <div className="font-bold text-[11px] mb-2">{shipment.customer_name}</div>
                <div className="text-gray-700 leading-relaxed">
                  SAME AS CONSIGNEE
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <p className="text-gray-500 font-bold mb-1 uppercase">Port of Loading:</p>
                    <p className="font-bold">{shipment.origin_port || 'CHENNAI PORT, INDIA'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-bold mb-1 uppercase">Port of Discharge:</p>
                    <p className="font-bold">{shipment.destination_port || 'AS PER BL'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-transparent">
              <table className="w-full border-collapse text-[10px]">
                <thead>
                  <tr className="bg-[#BDD7EE] font-bold text-[#1A5276]">
                    <th className="border-b-[2px] border-black p-3 text-left w-16">S.NO</th>
                    <th className="border-b-[2px] border-black p-3 text-left">DESCRIPTION OF GOODS</th>
                    <th className="border-b-[2px] border-black p-3 text-center w-24">QUANTITY</th>
                    <th className="border-b-[2px] border-black p-3 text-center w-24">NET WEIGHT</th>
                    <th className="border-b-[2px] border-black p-3 text-center w-24">GROSS WEIGHT</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  <tr className="border-b border-gray-200">
                    <td className="p-3 text-center align-top border-r-[1px] border-black">01</td>
                    <td className="p-3 align-top border-r-[1px] border-black">
                      <p className="font-bold text-[11px] mb-2">{order.product || 'Fresh Produce'}</p>
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{order.packing_details || 'Packed as per export standards'}</p>
                      
                      {containers.length > 0 && (
                        <div className="mt-4 border-t pt-2 border-dotted border-gray-400">
                          <p className="font-bold text-[#1A5276] mb-1 uppercase text-[9px]">Container Details:</p>
                          {containers.map((c: any, idx: number) => (
                            <div key={idx} className="grid grid-cols-2 gap-2 text-[9px] mb-1">
                              <span>CONT: {c.container_number}</span>
                              <span>SEAL: {c.seal_number || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center align-top font-bold border-r-[1px] border-black">{order.quantity} {order.unit}</td>
                    <td className="p-3 text-center align-top border-r-[1px] border-black">{(order.quantity * 0.95).toFixed(2)} KG</td>
                    <td className="p-3 text-center align-top">{order.quantity} KG</td>
                  </tr>
                  
                  {/* Filler space */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="h-12">
                      <td className="border-r-[1px] border-black"></td>
                      <td className="border-r-[1px] border-black"></td>
                      <td className="border-r-[1px] border-black"></td>
                      <td className="border-r-[1px] border-black"></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 border-t-[2px] border-black bg-transparent">
              <div className="border-r-[2px] border-black text-[10px] flex flex-col justify-between bg-transparent min-h-[140px]">
                <div className="p-3">
                  <h4 className="font-bold text-[#1A5276] mb-1 uppercase text-[9px]">Additional Information</h4>
                  <p className="leading-tight text-gray-600 italic">"This packing list is an integral part of the export documents and certifies the physical specification of the goods mentioned above."</p>
                </div>
                <div className="p-3 border-t border-dotted border-black">
                  <p className="leading-tight">Declaration : We hereby certify that the goods mentioned above are of Indian origin and correctly specified in this packing list.</p>
                </div>
              </div>

              <div className="p-3 flex flex-col justify-between text-[10px] bg-transparent">
                <div className="mb-2 font-bold">FOR SHASTIKA GLOBAL IMPEX PRIVATE LIMITED</div>
                <div className="mt-auto space-y-4 relative">
                  <div className="flex items-center gap-1">
                    <span className="font-bold uppercase text-[9px]">Authorized Signatory :</span>
                    <span className="border-b border-dotted border-black flex-1 px-1">{order.creator_name || '............................'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="font-bold uppercase text-[9px]">Seal & Sign :</div>
                    <div className="h-20 flex items-center justify-start">
                      {company?.signature_url && (
                        <img 
                          src={company.signature_url} 
                          alt="Seal" 
                          className="h-full w-auto object-contain mix-blend-multiply" 
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
