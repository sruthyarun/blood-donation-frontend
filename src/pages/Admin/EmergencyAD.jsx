import { useEffect, useState } from "react";
import {
    FaTint,
    FaUser,
    FaHospital,
    FaPhone,
    FaMapMarkerAlt,
    FaCheck,
    FaTimes,
} from "react-icons/fa";

import AdminPanel from "../../components/AdminPanel";


function AdminEmergencyRequests() {

    const [requests, setRequests] = useState([]);


    useEffect(() => {
        fetchRequests();
    }, []);


    const fetchRequests = async () => {

        try {

            const response = await fetch(
                "https://blood-donation-backend-olwl.onrender.com/api/emergencyRequests"
            );

            const data = await response.json();

            setRequests(data);

        } catch (error) {

            console.log(error);

        }

    };



    const updateStatus = async (request, status) => {

        try {

            await fetch(
                `https://blood-donation-backend-olwl.onrender.com/api/emergencyRequests/${request.id}`,
                {

                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        status
                    })

                }
            );


            if (status === "Approved") {


                const notification = {

                    title: "Emergency Blood Request Approved",

                    type: "emergency",

                    emailTo: request.email,

                    emailBy: "admin@gmail.com",

                    message:
                        `Your emergency blood request for ${request.patientName} has been approved.`,

                    time: "Just now",

                    read: false

                };



                await fetch(
                    "https://blood-donation-backend-olwl.onrender.com/api/notifications",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(notification)

                    }
                );

            }



            fetchRequests();


            alert(`Request ${status}`);



        } catch (error) {

            console.log(error);

        }

    };



    return (

        <div className="min-h-screen bg-gray-100 flex">


            <AdminPanel />


            <div className="flex-1 p-8">


                <h1 className="text-3xl font-bold mb-2">
                    Emergency Blood Requests
                </h1>


                <p className="text-gray-500 mb-8">
                    Manage urgent blood requests from hospitals and recipients
                </p>

                <div className="space-y-6">


                    {
                        requests.length === 0 ?

                            (

                                <div className="bg-white p-8 rounded-xl text-center">

                                    No Emergency Requests Found

                                </div>

                            )

                            :

                            requests.map((request) => (


                                <div
                                    key={request.id}
                                    className="bg-white rounded-xl shadow-lg p-6"
                                >


                                    <div className="flex justify-between">


                                        <div className="space-y-3">


                                            <h2 className="text-xl font-bold text-red-600 flex gap-2 items-center">

                                                <FaTint />

                                                {request.bloodGroup}

                                                <span className="text-gray-700">
                                                    ({request.units} Units)
                                                </span>

                                            </h2>




                                            <p className="flex gap-2 items-center">

                                                <FaUser className="text-red-600" />

                                                Patient:
                                                <b>
                                                    {request.patientName}
                                                </b>

                                            </p>



                                            <p className="flex gap-2 items-center">

                                                <FaHospital className="text-red-600" />

                                                {request.hospital}

                                            </p>




                                            <p className="flex gap-2 items-center">

                                                <FaMapMarkerAlt className="text-red-600" />

                                                {request.district}

                                            </p>



                                            <p className="flex gap-2 items-center">

                                                <FaPhone className="text-red-600" />

                                                {request.contact}

                                            </p>




                                            <p>
                                                <b>Reason:</b>
                                                {request.reason}
                                            </p>



                                            <p>
                                                Requested By:
                                                <span className="font-semibold ml-2">
                                                    {request.requestedBy}
                                                </span>
                                            </p>



                                        </div>





                                        <div className="flex flex-col items-end gap-4">


                                            <span
                                                className={`px-4 py-2 rounded-full font-semibold
                                            
                                            ${request.status === "Approved"
                                                        ?
                                                        "bg-green-100 text-green-700"

                                                        :

                                                        request.status === "Rejected"
                                                            ?
                                                            "bg-red-100 text-red-700"

                                                            :

                                                            "bg-yellow-100 text-yellow-700"

                                                    }`}
                                            >

                                                {request.status}

                                            </span>





                                            {
                                                request.status === "Active" &&

                                                <div className="flex gap-3">


                                                    <button

                                                        onClick={() =>
                                                            updateStatus(
                                                                request,
                                                                "Approved"
                                                            )
                                                        }

                                                        className="bg-green-600 text-white p-3 rounded-lg"
                                                    >

                                                        <FaCheck />

                                                    </button>



                                                    <button

                                                        onClick={() =>
                                                            updateStatus(
                                                                request,
                                                                "Rejected"
                                                            )
                                                        }

                                                        className="bg-red-600 text-white p-3 rounded-lg"

                                                    >

                                                        <FaTimes />

                                                    </button>


                                                </div>

                                            }


                                        </div>


                                    </div>


                                </div>


                            ))

                    }


                </div>


            </div>


        </div>

    );

}


export default AdminEmergencyRequests;