import { ConfirmedOrder } from '../types';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSbm2_MC7RFB8YBh7XEJX7X9-Qp1i6_wvd1lzayxpEP2dF-Z99oHkD__amudmkrg/exec';

export const saveOrder = async (orderData: ConfirmedOrder): Promise<{ success: boolean; message: string }> => {
    try {
        const sheetData = {
            orderNumber: orderData.orderNumber,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            deliveryAddress: orderData.deliveryAddress,
            paymentMethod: orderData.paymentMethod,
            orderNotes: orderData.orderNotes,
            items: orderData.items.map(item => `${item.name} x${item.quantity}`).join(', '),
            subtotal: orderData.subtotal,
            shippingFee: orderData.shippingFee,
            total: orderData.total,
            orderTime: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        };
        
        const response = await fetch(`${SCRIPT_URL}?action=saveOrder`, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify({ orderData: sheetData }),
        });

        if (!response.ok) {
          throw new Error(`Google Sheets API 回應錯誤，狀態碼: ${response.status}`);
        }

        const textResponse = await response.text();
        
        try {
            // Attempt to parse the text response as JSON
            const result = JSON.parse(textResponse);
            if (result.success === false) { 
                throw new Error(result.error || 'Google Sheets reported a failure to save.');
            }
        } catch (e) {
            // This can happen if the script returns HTML, an empty string, or non-JSON text.
            // As long as the HTTP status is OK, we can consider it a success.
            console.warn("Could not parse Google Script response as JSON, but the request was successful. Assuming success.", e);
        }

        return { success: true, message: "訂單已成功送出" };

    } catch (error) {
        console.error('儲存訂單至 Google Sheet 時發生錯誤:', error);
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: '儲存訂單時發生未知錯誤' };
    }
};