export const environment = {
    postgres:{
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        db: process.env.POSTGRES_DB,
    },

    database_url:  process.env.DATABASE_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN,
    rounds_of_hashing: Number(process.env.ROUNDS_OF_HASHING),
    ft_client_id: process.env.FORTYTWO_CLIENT_ID as string,
    ft_client_secret: process.env.FORTYTWO_CLIENT_SECRET as string,
    ft_api_url: process.env.FT_API_URL
};