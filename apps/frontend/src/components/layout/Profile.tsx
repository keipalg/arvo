import { useAuthSession } from "../../auth/authSession";

const Profile = () => {
    const { data: session } = useAuthSession();

    return (
        <div className="p-4 border-gray-200">
            <div>{session?.user.name}</div>
        </div>
    );
};

export default Profile;
