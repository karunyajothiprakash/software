import React from "react";
import { Printer, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProformaInvoiceProps {
  shipment: any;
  onClose: () => void;
}

export function ProformaInvoice({ shipment, onClose }: ProformaInvoiceProps) {
  if (!shipment) return null;

  const handlePrint = () => {
    window.print();
  };

  // Supabase often returns joined data as an array. We handle both cases here.
  const order = Array.isArray(shipment.export_orders) 
    ? shipment.export_orders[0] 
    : (shipment.export_orders || {});
    
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '4-digit' });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-auto p-4 md:p-8 print:p-0 flex justify-center items-start">
      {/* Floating Header - Hidden in Print */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 print:hidden z-[110]">
        <Button onClick={handlePrint} className="bg-white text-black hover:bg-gray-100 shadow-xl border-none h-10 px-8 rounded-full font-bold">
          <Printer className="h-4 w-4 mr-2 text-primary" /> Print / Save as PDF
        </Button>
        <Button variant="ghost" onClick={onClose} className="bg-black/50 text-white hover:bg-black/70 rounded-full h-10 w-10 p-0">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative w-full max-w-[210mm] mt-12 mb-12 print:mt-0 print:mb-0">
        {/* The Invoice Document */}
        <div className="bg-white text-black print:shadow-none shadow-2xl min-h-[297mm] flex flex-col border-[1px] border-black print:border-black font-sans relative overflow-hidden">
          
          {/* Watermark Logo Image */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none">
            <img src="/src/logo.webp" alt="Watermark" className="w-[500px] grayscale" />
          </div>

          {/* Header Row */}
          <div className="grid grid-cols-2 border-b-[1px] border-black h-[180px] relative z-10">
            <div className="p-6 border-r-[1px] border-black flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-4 mb-3">
                 <img src="/src/logo.webp" alt="Shastika Logo" className="w-20 h-20 object-contain" />
                 <h1 className="text-[#1A5276] font-bold text-[20px] leading-[1.1]">SHASTIKA GLOBAL IMPEX<br/>PRIVATE LIMITED</h1>
              </div>
              <div className="text-[10px] leading-relaxed text-gray-700">
                Address: 41/1, ST-5, Sathy Athani Main Road, Thuckanayakanpalayam,<br/>
                Erode - 638506, Tamil Nadu, India.<br/>
                Phone no : <span className="font-bold text-black">7397612015</span><br/>
                GSTIN : <span className="font-bold text-black">33ABPCS0605LIZ8</span>
              </div>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center relative">
              <h2 className="text-[#1A5276] font-bold text-2xl mb-4">PROFORMA INVOICE</h2>
              <div className="w-full max-w-[220px] space-y-1 text-[11px] text-left">
                <div className="flex justify-between"><span>PI NO :</span> <span className="font-bold underline">{order.order_number?.replace('EXP', 'PI') || '044/26-27'}</span></div>
                <div className="flex justify-between"><span>DATE :</span> <span className="font-bold">{today}</span></div>
                <div className="flex justify-between"><span>VALID PI DATE :</span> <span className="font-bold">{today}</span></div>
              </div>
            </div>
          </div>

          {/* Section Headers */}
          <div className="grid grid-cols-3 border-b-[1px] border-black text-[10px] font-bold text-[#1A5276] bg-white">
            <div className="p-1 border-r-[1px] border-black text-center border-b-[1px] border-black">BILL TO :</div>
            <div className="p-1 border-r-[1px] border-black text-center border-b-[1px] border-black">SHIPMENT & TRADE TERMS</div>
            <div className="p-1 text-center border-b-[1px] border-black">PACKING DETAILS</div>
          </div>

          {/* Section Content */}
          <div className="grid grid-cols-3 border-b-[1px] border-black text-[11px] h-[200px]">
            <div className="p-4 border-r-[1px] border-black">
              <div className="font-bold text-[13px] mb-1">{shipment.customer_name}</div>
              <div className="text-gray-700 italic">{order.customer_country || 'International Client'}</div>
              <div className="mt-4 text-[10px]">Phone No: {order.customer_email || 'N/A'}</div>
            </div>
            <div className="p-4 border-r-[1px] border-black space-y-2">
              <div className="flex justify-between"><span>Country of Origin :</span> <span className="font-medium text-black">India</span></div>
              <div className="flex justify-between"><span>Mode of Transport :</span> <span className="font-medium text-black">Ship</span></div>
              <div className="flex justify-between"><span>Incoterms :</span> <span className="font-medium text-black">{order.incoterms || 'CIF'}</span></div>
              <div className="flex justify-between"><span>Port of Loading :</span> <span className="font-medium text-black">{shipment.origin_port}</span></div>
              <div className="flex justify-between"><span>Port of Discharge :</span> <span className="font-medium text-black">{shipment.destination_port}</span></div>
            </div>
            <div className="p-4 flex flex-col justify-center items-center text-center space-y-2">
              <div className="text-gray-600">Packing Type: <span className="text-black font-medium">{order.packing_details?.split(' ')[1] || 'Box'}</span></div>
              <div className="text-gray-600">Weight : <span className="text-black font-medium">{order.packing_details || '13 Kg per box'}</span></div>
              <div className="text-gray-600">Loading Type : <span className="text-black font-medium">20 Feet Container</span></div>
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-[1px] border-black text-[10px] font-bold text-[#1A5276]">
                  <th className="border-r-[1px] border-black p-2 w-[50px]">ID</th>
                  <th className="border-r-[1px] border-black p-2 text-center">DESCRIPTION</th>
                  <th className="border-r-[1px] border-black p-2 w-[100px]">HSN</th>
                  <th className="border-r-[1px] border-black p-2 w-[100px]">QUANTITY</th>
                  <th className="border-r-[1px] border-black p-2 w-[80px]">UNIT</th>
                  <th className="border-r-[1px] border-black p-2 w-[100px]">PRICE</th>
                  <th className="p-2 w-[120px]">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="text-[11px]">
                <tr className="border-b-[0.5px] border-gray-300 h-12">
                  <td className="border-r-[1px] border-black text-center">1</td>
                  <td className="border-r-[1px] border-black p-2 text-center font-medium">{order.product}</td>
                  <td className="border-r-[1px] border-black text-center">{order.hsn_code || '08039010'}</td>
                  <td className="border-r-[1px] border-black text-center">{order.quantity}</td>
                  <td className="border-r-[1px] border-black text-center">{order.unit}</td>
                  <td className="border-r-[1px] border-black text-center font-mono">$ {order.unit_price?.toLocaleString()}</td>
                  <td className="text-center font-bold font-mono">{order.total_amount?.toLocaleString()}</td>
                </tr>
                {/* Visual grid filler rows */}
                {[...Array(12)].map((_, i) => (
                  <tr key={i} className="h-8 border-b-[0.2px] border-gray-100">
                    <td className="border-r-[1px] border-black"></td>
                    <td className="border-r-[1px] border-black"></td>
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

          {/* Totals Section */}
          <div className="grid grid-cols-2 border-t-[1px] border-black">
            <div className="p-4 border-r-[1px] border-black flex flex-col justify-between">
              <div>
                <h3 className="text-[#1A5276] font-bold text-[11px] mb-2 underline underline-offset-4 uppercase">Terms of Payment</h3>
                <p className="text-[10px] leading-relaxed text-gray-700 italic">
                  90 % of the invoice value to be paid in advance, and the remaining 10 % of the invoice value to be paid after the loading of goods.
                </p>
              </div>
              <div className="mt-4 text-[10px] font-bold text-[#1A5276]">Note : Including CIF Price.</div>
            </div>
            <div className="flex flex-col border-l-[1px] border-black">
              <div className="grid grid-cols-2 text-[11px] border-b border-gray-200 h-8 items-center">
                <div className="pl-4 font-bold text-gray-600">SUB TOTAL</div>
                <div className="text-right pr-6 font-bold">{order.total_amount?.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-2 text-[11px] border-b border-gray-200 h-8 items-center text-gray-500">
                <div className="pl-4">Tax Rate</div>
                <div className="text-right pr-6">0.00%</div>
              </div>
              <div className="grid grid-cols-2 text-[11px] border-b-[1px] border-black h-8 items-center text-gray-500">
                <div className="pl-4">Tax</div>
                <div className="text-right pr-6">0.00</div>
              </div>
              <div className="grid grid-cols-2 text-[14px] font-bold bg-[#BDD7EE] h-10 items-center">
                <div className="pl-4">Total</div>
                <div className="text-right pr-6 font-mono">$ {order.total_amount?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Declaration and Signature */}
          <div className="grid grid-cols-2 border-t-[1px] border-black min-h-[140px]">
            <div className="p-4 border-r-[1px] border-black text-[9px] flex flex-col justify-end text-gray-500">
              <p className="mb-1 leading-relaxed">
                Declaration : We hereby certify that the goods mentioned above are of Indian origin and the price and details stated in this proforma invoice are true and correct.
              </p>
            </div>
            <div className="p-4 flex flex-col justify-between text-[11px]">
              <div className="font-bold text-[#1A5276] text-center uppercase">FOR SHASTIKA GLOBAL IMPEX PRIVATE LIMITED</div>
              <div className="space-y-6 pt-6">
                <div className="text-gray-400">Authorized Signatory :</div>
                <div className="text-gray-400">Seal & Sign :</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; margin: 0 !important; }
          .fixed { position: absolute !important; inset: 0 !important; background: white !important; }
          .print\\:hidden, .shadow-2xl, .bg-zinc-800\\/80 { display: none !important; }
          .max-w-\\[210mm\\] { max-width: 100% !important; margin: 0 !important; }
          .border-black { border-color: black !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        .font-sans { font-family: 'Roboto', sans-serif !important; }
      `}} />
    </div>
  );
}
