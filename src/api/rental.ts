interface RentPayload {
    vehical_id?: number;
    rent_id?: number;
    start_date: string;
    end_date: string;
    country: string;
    city: string;
    client_name: string;
    email: string;
    tel: string;
    tel_2?: string;
    socials: Array<{ Telegram: boolean; Whatsapp: boolean; Viber: boolean }>;
    payment_koeff: number;
    payable: number;
    currency: string;
    services: any[];
}

export const createOrUpdateRent = async (payload: RentPayload, token: string | null) => {
    try {
        const response = await fetch("https://dev2.getmecar.ru/wp-json/listing-api/v1/data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ new_rent: payload }),
        });

        if (response.ok) {
            const contentType = response.headers.get("Content-Type");

            if (contentType && contentType.includes("application/json")) {
                try {
                    const data = await response.json();
                    console.log("Успешный ответ сервера:", data);
                    return data;
                } catch (jsonError) {
                    console.log("Ответ сервера успешен, но JSON невалидный или пустой.");
                    return null; // Возвращаем null, если JSON невалидный
                }
            } else {
                console.log("Ответ сервера успешен, но тело ответа пустое или не JSON.");
                return null;
            }
        } else {
            // Обработка ошибки, если статус не 200
            const contentType = response.headers.get("Content-Type");

            if (contentType && contentType.includes("application/json")) {
                const errorDetails = await response.json();
                console.error("Ошибка сервера (JSON):", errorDetails);
                throw new Error(`Ошибка сервера: ${response.status} - ${response.statusText}`);
            } else {
                const errorText = await response.text();
                console.error("Ошибка сервера (текст):", errorText);
                throw new Error(`Ошибка сервера: ${response.status} - ${response.statusText}`);
            }
        }
    } catch (error) {
        console.error("Ошибка при выполнении запроса:", error);
        throw error;
    }
};

