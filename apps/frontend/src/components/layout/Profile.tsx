import { authClient } from "../../auth/auth-client";

const Profile = () => {
    const { data: session } = authClient.useSession();

    return (
        <div className="p-4 border-gray-200">
            <div>{session?.user.name}</div>
        </div>
    );
};

export default Profile;
