import Tag from "../../../Layout/Tag";
import { userAtom } from "../../../lib/atoms";
import {
    deleteEnvironment,
    saveEnvironment,
    getEnvironmentLogo,
    likeOrDislike,
    updateEnvironmentLogo,
} from "../../../lib/environments";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    TbBookmark,
    TbBookmarkFilled,
    TbEdit,
    TbStar,
    TbStarFilled,
    TbTrash,
} from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import DefaultAvatar from "../../../Components/DefaultAvatar";
import {
    tagInterface,
    environment as tEnvironment,
} from "../../../lib/interfaces";
import AvatarComponent from "../../../Components/AvatarComponent";
import { Separator } from "@/Components/ui/separator";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { WebviewWindow } from "@tauri-apps/api/window";
import ApplyModal from "./Modals/ApplyModal";

export default function Environment({
    environment,
    setEditedEnvironmentId,
    setIsUserEditingEnvironment,
    index,
    className = "",
    where = "profile",
    canChangeLogo = false,
    view = "normal",
}: {
    environment: tEnvironment;
    setEditedEnvironmentId?: React.Dispatch<React.SetStateAction<number>>;
    setIsUserEditingEnvironment?: React.Dispatch<React.SetStateAction<boolean>>;
    index: number;
    className?: string;
    where?: "profile" | "page" | "saved";
    canChangeLogo?: boolean;
    view?: "normal" | "compact";
}): JSX.Element {
    const [likesCount, setLikesCount] = useState<number>(
        environment.likes || 0
    );
    const [isLiked, setIsLiked] = useState<boolean>(
        environment.isLiked || false
    );
    const [environmentLogo, setEnvironmentLogo] = useState<string>();
    const [isSaved, setIsSaved] = useState<boolean>(
        environment.isSaved || false
    );
    const [savesCount, setSavesCount] = useState<number>(
        environment.saves || 0
    );
    const [isApplying, setIsApplying] = useState<boolean>(false);

    const loggedUserData = useAtomValue(userAtom);
    const navigate = useNavigate();

    useEffect(() => {
        getEnvLogo();
    }, [environment.id]);

    async function getEnvLogo(): Promise<void> {
        const res = await getEnvironmentLogo(environment.id);
        if (res) {
            const url = URL.createObjectURL(
                new Blob([res], { type: "image/png" })
            );
            setEnvironmentLogo(url);
        }
    }

    async function changeEnvironmentLikeStatus(): Promise<void> {
        if (isLiked) {
            setLikesCount((prev) => prev - 1);
            setIsLiked(false);
            const res = await likeOrDislike(environment.id);
            if (!res) {
                setLikesCount((prev) => prev + 1);
                setIsLiked(true);
                toast.error("Something went wrong");
            }
        } else {
            setLikesCount((prev) => prev + 1);
            setIsLiked(true);
            const res = await likeOrDislike(environment.id);
            if (!res) {
                setLikesCount((prev) => prev - 1);
                setIsLiked(false);
                toast.error("Something went wrong");
            }
        }
    }

    async function changeEnvironmentSaveStatus(): Promise<void> {
        if (isSaved) {
            setSavesCount((prev) => prev - 1);
            setIsSaved(false);
            const res = await saveEnvironment(environment.id);
            if (!res) {
                setSavesCount((prev) => prev + 1);
                setIsSaved(true);
                toast.error("Something went wrong");
            }
        } else {
            setSavesCount((prev) => prev + 1);
            setIsSaved(true);
            const res = await saveEnvironment(environment.id);
            if (!res) {
                setSavesCount((prev) => prev - 1);
                setIsSaved(false);
                toast.error("Something went wrong");
            }
        }
    }

    async function deleteEnv(): Promise<void> {
        if (confirm("Are you sure you want to delete this environment?")) {
            const toastId = toast.loading("Deleting environment...");
            const res = await deleteEnvironment(environment.id);
            if (res) {
                toast.success("Environment deleted", { id: toastId });
                navigate("/");
            } else {
                toast.error("Something went wrong", { id: toastId });
            }
        }
    }

    async function changeLogo(
        e: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> {
        if (!e.target.files) return;
        const file = e.target.files[0];
        if (!file.type.includes("image")) {
            toast.error("Logo must be an image");
            e.target.value = "";
            return;
        } else if (file.size > 1024 * 1024 * 5) {
            toast.error("Logo can't be bigger than 5MB");
            e.target.value = "";
            return;
        }
        setEnvironmentLogo(URL.createObjectURL(e.target.files[0]));
        const formData = new FormData();
        formData.append("logo", file);
        const res = await updateEnvironmentLogo(environment.id, formData);
        if (res) {
            toast.success("Logo updated");
        } else {
            toast.error("Something went wrong");
            setEnvironmentLogo("");
        }
    }

    function createFullscreenWindow(): void {
        setIsApplying(true);

        setTimeout(() => {
            const webview = new WebviewWindow("Some_kind_of_fullscreen_img", {
                url: "/imgdlapicu",
                fullscreen: true,
            });

            webview.once("tauri://created", function () {
                webview.setFocus();
                setIsApplying(false);
            });
        }, 2500);
    }

    const normalView = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * index, duration: 0.2 },
            }}
            key={environment.id}
            className={`${className} w-full flex rounded-lg h-64 shadow-darkMain shadow-[0_0_6px_rgba(255,255,255,0.1)] relative overflow-hidden`}
        >
            <ApplyModal
                isOpen={isApplying}
                close={() => setIsApplying(false)}
            />
            <div className="relative aspect-square w-64 h-64 group flex items-center justify-center">
                {environmentLogo ? (
                    <img src={environmentLogo} className="!w-64 h-64" />
                ) : (
                    <DefaultAvatar
                        size={256}
                        isRounded={false}
                        username={environment.name}
                        className="aspect-square"
                    />
                )}
                <input
                    type="file"
                    name="logo"
                    id="logo"
                    className="hidden"
                    onChange={(e) => changeLogo(e)}
                />
                {canChangeLogo && (
                    <label
                        htmlFor="logo"
                        className="w-64 h-64 absolute inset-0 bg-black/40 hidden group-hover:flex justify-center items-center text-white text-4xl cursor-pointer"
                    >
                        <TbEdit />
                    </label>
                )}
            </div>
            <div className="flex p-4 flex-col justify-between gap-4 w-full h-full">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-4">
                        {where === "profile" ? (
                            <Link
                                className="hover:underline text-xl font-poppins text-gray-400"
                                title="Environment details"
                                to={`/environments/${environment.id}`}
                            >
                                {environment.name}
                            </Link>
                        ) : (
                            <p className="text-xl font-poppins text-gray-400">
                                {environment.name}
                            </p>
                        )}
                        {where === "saved" && (
                            <span className="flex items-center gap-2">
                                <Switch
                                    id="asd"
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            createFullscreenWindow();
                                        }
                                    }}
                                />
                                <Label
                                    htmlFor="asd"
                                    className="cursor-pointer text-muted-foreground"
                                >
                                    Environment appliance
                                </Label>
                            </span>
                        )}
                    </div>
                    <span className="flex flex-col items-end gap-px text-gray-500 font-poppins text-lg">
                        <Link
                            to={`/profile/${environment.user.id}`}
                            className="flex items-center gap-2"
                        >
                            <span>{environment.user.username}</span>
                            <AvatarComponent
                                userId={environment.user.id}
                                username={environment.user.username}
                                size="small"
                            />
                        </Link>
                        <p className="text-sm">
                            Created:{" "}
                            {formatDistanceToNow(environment.createdAt, {
                                addSuffix: true,
                            })}
                        </p>
                        {environment.updatedAt !== environment.createdAt && (
                            <p className="text-sm">
                                Updated:{" "}
                                {formatDistanceToNow(environment.updatedAt, {
                                    addSuffix: true,
                                })}
                            </p>
                        )}
                        <span className="flex items-center gap-4">
                            <span
                                className={twMerge(
                                    isLiked
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                    "flex items-center justify-end gap-2 cursor-pointer"
                                )}
                                onClick={changeEnvironmentLikeStatus}
                            >
                                {likesCount}
                                {isLiked ? (
                                    <TbStarFilled className="text-yellow-500 cursor-pointer" />
                                ) : (
                                    <TbStar className="text-yellow-500 cursor-pointer" />
                                )}
                            </span>
                            <span
                                className={twMerge(
                                    isSaved
                                        ? "text-foreground"
                                        : "text-muted-foreground",
                                    "flex items-center justify-end gap-2 cursor-pointer"
                                )}
                                onClick={changeEnvironmentSaveStatus}
                            >
                                {savesCount}
                                {isSaved ? (
                                    <TbBookmarkFilled className="text-foreground cursor-pointer" />
                                ) : (
                                    <TbBookmark className="text-muted-foreground cursor-pointer" />
                                )}
                            </span>
                        </span>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {environment.tags.length > 0 &&
                        environment.tags
                            .slice(0, 5)
                            .map((tag: tagInterface, i: number) => {
                                return (
                                    <>
                                        <Tag
                                            key={tag.id}
                                            tag={tag}
                                            animation={true}
                                            i={i}
                                        />
                                        {i !== environment.tags.length - 1 && (
                                            <Separator
                                                orientation="vertical"
                                                className="h-6"
                                            />
                                        )}
                                    </>
                                );
                            })}
                    {environment.tags.length > 5 && (
                        <span
                            className="text-gray-500"
                            title={environment.tags
                                .slice(5)
                                .map((tag: tagInterface) => tag.name)
                                .join(", ")}
                        >
                            +{environment.tags.length - 5} more
                        </span>
                    )}
                </div>
                <span className="flex justify-between items-start gap-4 text-base mb-2">
                    <p className="font-poppins text-gray-500 line-clamp-2 leading-5">
                        {environment.description || "No description"}
                    </p>
                    <p className="flex items-center gap-2">
                        {loggedUserData.id === environment.user.id &&
                            setEditedEnvironmentId &&
                            setIsUserEditingEnvironment && (
                                <>
                                    <TbEdit
                                        onClick={() => {
                                            setEditedEnvironmentId(
                                                environment.id
                                            );
                                            setIsUserEditingEnvironment(true);
                                        }}
                                        title="Edit environment"
                                        className="cursor-pointer text-muted-foreground hover:text-gray-500 transition-colors"
                                    />
                                    <TbTrash
                                        onClick={deleteEnv}
                                        title="Delete environment"
                                        className="cursor-pointer text-muted-foreground hover:text-gray-500 transition-colors"
                                    />
                                </>
                            )}
                    </p>
                </span>
            </div>
        </motion.div>
    );

    const compactView = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * index, duration: 0.2 },
            }}
            key={environment.id}
            className={`${className} flex flex-col group justify-between rounded-lg w-80 h-96 shadow-[0_0_6px_rgba(255,255,255,0.1)] relative overflow-hidden bg-gradient-to-t from-transparent to-zinc-900 to-90%`}
        >
            {environmentLogo ? (
                <img
                    src={environmentLogo}
                    className="-z-10 absolute w-full h-full inset-0 group-hover:blur-sm transition-all duration-500"
                />
            ) : (
                <DefaultAvatar
                    size={320}
                    isRounded={false}
                    username={environment.name}
                    className="aspect-square -z-10 absolute w-full h-full inset-0 mt-auto"
                />
            )}
            <div className="p-4">
                <span className="flex items-center gap-2">
                    <Link
                        className="hover:underline text-xl font-poppins text-gray-400 mr-auto"
                        title="Environment details"
                        to={`/environments/${environment.id}`}
                    >
                        {environment.name}
                    </Link>
                    <p
                        className={twMerge(
                            isLiked ? "text-white" : "text-gray-400",
                            "flex items-center justify-end gap-2 cursor-pointer"
                        )}
                        onClick={changeEnvironmentLikeStatus}
                    >
                        {likesCount}
                        {isLiked ? (
                            <span className="relative">
                                <TbStarFilled className="text-yellow-500 cursor-pointer" />
                                <TbStarFilled className="text-yellow-500 cursor-pointer animate-ping-once absolute inset-0" />
                            </span>
                        ) : (
                            <TbStar className="text-yellow-500 cursor-pointer" />
                        )}
                    </p>
                    {where !== "saved" &&
                        !isSaved &&
                        loggedUserData.username && (
                            <TbBookmark
                                className="cursor-pointer text-gray-400 hover:text-gray-100 transition-colors"
                                onClick={changeEnvironmentSaveStatus}
                                title="Save environment"
                            />
                        )}
                </span>
                <div className="flex flex-col justify-center flex-wrap w-full gap-2 mt-4 group-hover:opacity-100 opacity-0 transition-all duration-500">
                    <Link
                        to={`/profile/${environment.user.id}`}
                        className="flex items-center gap-2"
                    >
                        <AvatarComponent
                            userId={environment.user.id}
                            username={environment.user.username}
                            size="small"
                        />
                        <p className="text-gray-400 font-poppins text-sm">
                            {environment.user.username}
                        </p>
                    </Link>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {environment.tags.length > 0 &&
                            environment.tags
                                .slice(0, 5)
                                .map((tag: tagInterface, i: number) => {
                                    return (
                                        <>
                                            <Tag
                                                key={tag.id}
                                                tag={tag}
                                                animation={true}
                                                i={i}
                                            />
                                        </>
                                    );
                                })}
                        {environment.tags.length > 5 && (
                            <span
                                className="text-gray-500"
                                title={environment.tags
                                    .slice(5)
                                    .map((tag: tagInterface) => tag.name)
                                    .join(", ")}
                            >
                                +{environment.tags.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <span className="group-hover:bottom-0 -bottom-36 relative transition-all duration-500 bg-background/70 border-t border-muted-foreground p-4">
                <p className="font-poppins text-lg text-muted-foreground line-clamp-2 drop-shadow-xl">
                    {environment.description || "No description"}
                </p>
                <p className="text-sm text-gray-400">
                    Created:{" "}
                    {formatDistanceToNow(environment.createdAt, {
                        addSuffix: true,
                    })}
                </p>
                {environment.updatedAt !== environment.createdAt && (
                    <p className="text-sm text-gray-400">
                        Updated:{" "}
                        {formatDistanceToNow(environment.updatedAt, {
                            addSuffix: true,
                        })}
                    </p>
                )}
            </span>
        </motion.div>
    );

    return view === "normal" ? normalView : compactView;
}
