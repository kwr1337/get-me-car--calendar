export const getToken = async (): Promise<string> => {
    const username = "GETmecar"; // Ваше имя пользователя
    const password = "GETmeCAR2022%2B%2B"; // Ваш пароль

    const response = await fetch(
        `https://dev2.getmecar.ru/wp-json/jwt-auth/v1/token?username=${username}&password=${password}`,
        {
            method: "POST",
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to obtain token: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.data || !data.data.token) {
        throw new Error("No token returned from the server");
    }

    return data.data.token; // Возвращаем токен
};


export const validateToken = async (token: string): Promise<boolean> => {
    const response = await fetch(
        "https://dev2.getmecar.ru/wp-json/jwt-auth/v1/token/validate",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.success || false;
};
