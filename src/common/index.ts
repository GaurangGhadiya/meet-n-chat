export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error

    }
}

export const file_path = ['profile', 'property']

export const loginType = {
    custom: 0,
    google: 1,
}

export const URL_decode = (url) => {
    try {
        let folder_name = [], image_name
        url.split("/").map((value, index, arr) => {

            image_name = url.split("/")[url.split("/").length - 1]
            folder_name = (url.split("/"))
            folder_name.splice(url.split("/").length - 1, 1)
        })
        return [folder_name.join('/'), image_name]
    }
    catch (error) {
        console.log(error)
        return error
    }
}

export const not_first_one = (a1: Array<any>, a2: Array<any>) => {
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++) {
        a[a1[i]] = true;
    }
    for (var i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
    }
    for (var k in a) {
        diff.push(k);
    }
    return diff;
}

export const SMS_message = {
    OTP_verification: `Kaldari app verification code:`,
}

export const booking_status = {
    pending: 0,
    accept: 1,
    reject: 2
}

export const getArea = (current: { lat: any, long: any }, RadiusInKm: number) => {
    const differenceForLat = RadiusInKm / 111.12
    const curve = Math.abs(Math.cos((2 * Math.PI * parseFloat(current.lat)) / 360.0))
    const differenceForLong = RadiusInKm / (curve * 111.12)
    const minLat = parseFloat(current.lat) - differenceForLat
    const maxLat = parseFloat(current.lat) + differenceForLat
    const minlon = parseFloat(current.long) - differenceForLong
    const maxlon = parseFloat(current.long) + differenceForLong;
    return {
        min: {
            lat: minLat,
            long: minlon,
        },
        max: {
            lat: maxLat,
            long: maxlon,
        },
    };
}
export const userStatus = {
    user: 0,
    admin: 1,
    upload: 5

}


export const notification_types = {
    add_booking: async (data: any) => {
        return {
            template: {
                body: `Congratulations! requested for photographer booking`
            },
            data: {
                type: 0, bookingId: data?.bookingId,
            }
        }
    },
    accept_booking: async (data: any) => {
        return {
            template: {
                body: `Congratulation! Your photographer booking has been approved!`
            },
            data: {
                type: 1, bookingId: data?.bookingId,
            }
        }
    },
    reject_booking: async (data: any) => {
        return {
            template: {
                body: `Your photographer booking has been rejected!`
            },
            data: {
                type: 2, bookingId: data?.bookingId,
            }
        }
    },
    complete_booking: async (data: any) => {
        return {
            template: {
                body: `Your photographer booking has been completed!`
            },
            data: {
                type: 2, bookingId: data?.bookingId,
            }
        }
    },
}

export const cacheKeyName = {
    allCountry: `ALL_COUNTRY`,
    country: (id: any): any => `COUNTRY_${id}`,
    state: (id: any): any => `STATE_${id}`,
}

export const [cachingTimeOut, commentLimit, perPIPPrice,] = [1800, 2, 0.05]