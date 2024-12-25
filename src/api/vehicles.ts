export const fetchVehicles = async (
    token: string,
    startDate?: string,
    endDate?: string
): Promise<any> => {
    const url = new URL("https://dev2.getmecar.ru/wp-json/listing-api/v1/data");
    url.searchParams.append("type", "listings");

    if (startDate) url.searchParams.append("start", startDate);
    if (endDate) url.searchParams.append("end", endDate);

    const response = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.statusText}`);
    }

    return response.json();
};