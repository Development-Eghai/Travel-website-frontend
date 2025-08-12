
import { APIBaseUrl } from "./ApiClient";

// *************************************************  TOUR DESTINATION API  **********************************************



export const CreateDestination = async (payload) => {
    return await APIBaseUrl.post("/destinations/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};
export const GetAllDestination = async () => {
    return await APIBaseUrl.get("/destinations/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificDestination = async (_id) => {
    return await APIBaseUrl.get(`/destinations/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetChildDestination = async (_id) => {
    return await APIBaseUrl.get(`/destinations/get_child_destination?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const UpdateDestination = async (payload) => {
    return await APIBaseUrl.put(`/destinations/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const DeleteDestination = async (_id) => {
    return await APIBaseUrl.delete(`/destinations/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


// *************************************************  TOUR CATEGORY API  **********************************************

export const CreateTourCategory = async (payload) => {
    return await APIBaseUrl.post("/trip-categories/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const GetAllTourCategory = async () => {
    return await APIBaseUrl.get("/trip-categories/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificTourCategory = async (_id) => {
    return await APIBaseUrl.get(`trip-categories/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const updateTourCategory = async (payload) => {
    return await APIBaseUrl.put(`trip-categories/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const deleteTourCategory = async (_id) => {
    console.log(_id, "deleteTourCategory");
    return await APIBaseUrl.delete(`trip-categories/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};




// *************************************************  TOUR TYPE API  **********************************************

export const CreateTourType = async (payload) => {
    return await APIBaseUrl.post("/trip-types/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const GetAllTourType = async () => {
    return await APIBaseUrl.get("/trip-types/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificTourType = async (_id) => {
    return await APIBaseUrl.get(`trip-types/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const updateTourType = async (payload) => {
    return await APIBaseUrl.put(`trip-types/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const deleteTourType = async (_id) => {
    console.log(_id, "deleteTourCategory");
    return await APIBaseUrl.delete(`trip-types/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


// *************************************************  TOUR TYPE API  **********************************************

export const CreateActivity = async (payload) => {
    return await APIBaseUrl.post("/activities/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const GetAllActivity = async () => {
    return await APIBaseUrl.get("/activities/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificActivity = async (_id) => {
    return await APIBaseUrl.get(`activities/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const updateActivity = async (payload) => {
    return await APIBaseUrl.put(`activities/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const deleteActivity = async (_id) => {
    return await APIBaseUrl.delete(`activities/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};



// *************************************************  Blog Tag API  **********************************************

export const CreateBlogTag = async (payload) => {
    return await APIBaseUrl.post("/blog-tag/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const GetAllBlogTag = async () => {
    return await APIBaseUrl.get("/blog-tag/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificBlogTag = async (_id) => {
    return await APIBaseUrl.get(`blog-tag/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const UpdateBlogTag = async (payload) => {
    return await APIBaseUrl.put(`blog-tag/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const DeleteBlogTag = async (_id) => {
    return await APIBaseUrl.delete(`blog-tag/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};
// *************************************************  Blog Category API  **********************************************

export const CreateBlogCategory = async (payload) => {
    console.log(payload)
    return await APIBaseUrl.post("/blog-category/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const GetAllBlogCategory = async () => {
    return await APIBaseUrl.get("/blog-category/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificBlogCategory = async (_id) => {
    return await APIBaseUrl.get(`blog-category/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const UpdateBlogCategory = async (payload) => {
    return await APIBaseUrl.put(`blog-category/update`, payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const DeleteBlogCategory = async (_id) => {
    return await APIBaseUrl.delete(`blog-category/delete`, {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


// *************************************************  Trip Collection API  **********************************************

export const CreateTripPackage = async (payload) => {
    return await APIBaseUrl.post("/trips/create", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetAllTrip = async () => {
    return await APIBaseUrl.get("/trips/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const TourPreviewDetails = async (_id) => {
    return await APIBaseUrl.get(`trips/get_trip_preview?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


// ************************************************  SINGLE FILE UPLOAD API **********************************************

export const SingleFileUpload = async (payload) => {
    return await APIBaseUrl.post("/uploads/single-upload", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};


export const MultipleFileUpload = async (payload) => {
    return await APIBaseUrl.post("/uploads/multiple-upload", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

// *************************************************  LEAD MANAGEMENT API  **********************************************

export const CreateLead = async (payload) => {
    return await APIBaseUrl.post("/leads/create_lead", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetAllLeads = async () => {
    return await APIBaseUrl.get("/leads/get_all")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const GetSpecificLead = async (_id) => {
    return await APIBaseUrl.get(`/leads/get_specific?_id=${_id}`)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const UpdateLead = async (payload) => {
    return await APIBaseUrl.put("/leads/update", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const UpdateLeadStatus = async (payload) => {
    return await APIBaseUrl.put("/leads/update_lead", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

export const DeleteLead = async (_id) => {
    return await APIBaseUrl.delete("/leads/delete", {
        data: { _id }
    })
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

// *************************************************  QUOTE MANAGEMENT API  **********************************************

export const CreateQuote = async (payload) => {
    console.log(payload, "CreateQuote");
    return await APIBaseUrl.post("/leads/create_quote", payload)
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};

// Fetch all quotations
export const GetAllQuotes = async () => {
    return await APIBaseUrl.get("/quotations")
        .then((response) => response.data)
        .catch((err) => {
            return { err: err?.response?.data || err };
        });
};