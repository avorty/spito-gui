import AvatarComponent from "../../../Components/AvatarComponent";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import Loader from "../../../Layout/Loader";
import AvatarEditModal from "../../../Pages/Profile/Components/Modals/AvatarEditModal";
import { userAtom } from "../../../lib/atoms";
import { ProfileInterface } from "../../../lib/interfaces";
import {
    getUserProfile,
    updateAvatar,
    updateSettings,
} from "../../../lib/user";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { TbEdit } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/Components/ui/textarea";

export default function MainSettings(): JSX.Element {
    const loggedUserData = useAtomValue(userAtom);
    const navigate = useNavigate();

    const [userData, setUserData] = useState<ProfileInterface>({
        username: "",
        description: "",
        id: 0,
    });
    const [isUserChangingAvatar, setIsUserChangingAvatar] =
        useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string>("");
    const [avatarBlob, setAvatarBlob] = useState<Blob>();
    const [username, setUsername] = useState<string>(userData.username);
    const [description, setDescription] = useState<string>(
        userData.description || ""
    );
    const [isLoading, setIsLoading] = useState<boolean>(true);

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newAvatarRef = useRef<any>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    async function fetchData(): Promise<void> {
        const response = await getUserProfile(loggedUserData.id);
        if (response.status === 401) {
            navigate("/");
        }
        if (response.status === 200) {
            setUserData(response.data);
            setDescription(response.data.description || "");
            setUsername(response.data.username);
        }
        setIsLoading(false);
    }

    async function handleSaveSettings(): Promise<void> {
        if (username && description) {
            if (username === "") {
                toast.error("Username can't be empty!");
                return;
            }
            if (
                description === userData?.description &&
                username === userData?.username
            ) {
                return;
            }
            const toastId = toast.loading("Updating...");
            const isSettingsStatusOk = await updateSettings({
                username,
                description,
            });

            if (isSettingsStatusOk) {
                toast.success("Settings saved!", {
                    id: toastId,
                });
                fetchData();
            } else {
                toast.error("Failed to save settings!", {
                    id: toastId,
                });
            }
        }
    }

    useEffect(() => {
        handleAvatarChange();
    }, [avatarBlob]);

    useEffect(() => {
        fetchData();
    }, []);

    function handleUserChaningAvatar(): void {
        setIsUserChangingAvatar(!isUserChangingAvatar);
        clearFileInput();
    }

    function clearFileInput(): void {
        if (avatarInputRef.current) {
            avatarInputRef.current.value = "";
        }
    }

    async function handleAvatarChange(): Promise<void> {
        if (!avatarBlob) return;
        const avatarFile = new File([avatarBlob], "avatar.png", {
            type: "image/png",
        });
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);
        const isAvatarStatusOk = await updateAvatar(avatarFormData);
        const toastId = toast.loading("Updating avatar...");
        if (isAvatarStatusOk) {
            toast.success("Avatar updated succesfully", {
                id: toastId,
            });
        } else {
            toast.error("Failed to save avatar", {
                id: toastId,
            });
        }
    }

    function saveAvatarImage(): void {
        if (!newAvatarRef.current) return;
        const canvas: HTMLCanvasElement = newAvatarRef.current?.getImage();
        canvas.toBlob((blob): void => {
            if (!blob) return;
            setAvatarUrl(URL.createObjectURL(blob));
            setAvatarBlob(blob);
        });
        clearFileInput();
        setIsUserChangingAvatar(false);
    }

    //eslint-disable-next-line
    function uploadAvatar(e: any): void {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "image/png" && file.type !== "image/jpeg") {
            toast.error("Only .png and .jpeg files are allowed!");
            clearFileInput();
            return;
        }
        setAvatarUrl(URL.createObjectURL(file));
        setIsUserChangingAvatar(true);
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}
            key="main"
            className="flex justify-center items-center pb-28 gap-64 flex-1"
        >
            {isLoading ? (
                <Loader />
            ) : (
                <>
                    <AvatarEditModal
                        isOpen={isUserChangingAvatar}
                        closeModal={handleUserChaningAvatar}
                        newAvatarRef={newAvatarRef}
                        avatarUrl={avatarUrl}
                        saveAvatarImage={saveAvatarImage}
                    />
                    <div className="w-fit flex flex-col gap-4">
                        <Input
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.currentTarget.value)}
                            max={16}
                        />
                        <Textarea
                            placeholder="Description"
                            defaultValue={userData?.description}
                            className="!h-40"
                            onChange={(e) =>
                                setDescription(e.currentTarget.value)
                            }
                        />
                        <p className="text-sm text-center font-poppins text-gray-400">
                            Be causious while editing profile, offensive content
                            will be deleted!
                        </p>
                        <Button
                            variant="default"
                            className="!w-full"
                            onClick={handleSaveSettings}
                        >
                            Save
                        </Button>
                    </div>
                    <div className="h-fit border-1 rounded-xl border-borderGray shadow-darkMain p-16 relative">
                        <div className="relative shadow-darkMain rounded-full">
                            {avatarBlob ? (
                                <img
                                    src={URL.createObjectURL(avatarBlob)}
                                    className="rounded-full peer w-72 h-72"
                                />
                            ) : (
                                <AvatarComponent
                                    username={userData?.username || ""}
                                    size="big"
                                    className="peer shadow-darkMain"
                                    userId={loggedUserData.id}
                                />
                            )}
                            <input
                                type="file"
                                name="avatarImage"
                                id="avatarImage"
                                className="hidden"
                                onChange={uploadAvatar}
                                defaultValue={avatarUrl}
                                ref={avatarInputRef}
                            />
                            <label
                                htmlFor="avatarImage"
                                className="absolute inset-0 rounded-full bg-black bg-opacity-60 hidden peer-hover:flex hover:flex justify-center items-center text-white text-5xl cursor-pointer"
                            >
                                <TbEdit />
                            </label>
                        </div>
                        <h1 className="text-gray-100 text-3xl font-poppins mt-8 mb-4 text-center">
                            {username}
                        </h1>
                        <p className="text-gray-400 text-lg font-poppins line-clamp-4 break-word overflow-hidden text-center">
                            {description || "This user has no description yet!"}
                        </p>
                    </div>
                </>
            )}
        </motion.div>
    );
}
