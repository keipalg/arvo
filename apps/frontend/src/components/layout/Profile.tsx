import { useAuthSession } from "../../auth/authSession";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../../utils/trpcClient";

const Profile = () => {
    const { data: session } = useAuthSession();
    const { data: userInfo } = useQuery(trpc.user.info.queryOptions());

    const user = userInfo && userInfo.length > 0 ? userInfo[0] : null;
    const storeName = user?.storeName || "Business Name";
    const image = user?.image || session?.user?.image;
    const name = user?.name || session?.user?.name;

    return (
        <div className="p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name || "User"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-xl font-semibold text-arvo-black-50">
                        {name?.charAt(0).toUpperCase() || "?"}
                    </span>
                )}
            </div>
            <div className="flex flex-col">
                <div className="font-semibold">{name}</div>
                <div className="text-sm text-gray-600">{storeName}</div>
            </div>
        </div>
    );
};

export default Profile;
