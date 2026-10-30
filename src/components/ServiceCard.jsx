

function ServiceCard({ icon, title, description }) {
    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex items-center gap-5 hover:-translate-y-2 ">

            <div className="w-[180px] rounded-full  flex items-center justify-center text-red-600">
                <img src={icon} className="w-[200px] "></img>
            </div>

            <div>
                <h3 className="text-xl font-semibold">{title}</h3>

                <p className="text-gray-500 mt-2">
                    {description}
                </p>
            </div>

        </div>
    );
}

export default ServiceCard;