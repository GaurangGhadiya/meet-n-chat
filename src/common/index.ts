
export const apiResponse = async (status, message, data, error) => {
    return {
        status,
        message,
        data: await (data),
        error: Object.keys(error)?.length == 0 ? {} : await (error)
    }
}

export const userStatus = {
    user: "user",
    admin: "admin",
    upload: "upload"
}