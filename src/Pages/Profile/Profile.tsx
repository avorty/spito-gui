import { ProfileInterface } from "../../lib/interfaces";
import { getUserProfile } from "../../lib/user";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    TbBook,
    TbBriefcase,
    TbFile,
    TbFolder,
    TbPlus,
    TbSettingsFilled,
} from "react-icons/tb";
import { useAtomValue } from "jotai";
import { userAtom } from "../../lib/atoms";
import Overview from "./Pages/Overview";
import Rules from "./Pages/Rules";
import Rulesets from "./Pages/Rulesets";
import Environments from "./Pages/Environments";
import ManageContentModal from "./Components/Modals/ManageContentModal";
import AvatarComponent from "../../Components/AvatarComponent";
import { Separator } from "@/Components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";

export default function Profile(): JSX.Element {
    const [userData, setUserData] = useState<ProfileInterface>();
    const [isUserAddingContent, setIsUserAddingContent] =
        useState<boolean>(false);
    const loggedUserData = useAtomValue(userAtom);
    const navigate = useNavigate();

    const { userId = 0 } = useParams<{ userId: string }>();

    async function fetchData(): Promise<void> {
        const response = await getUserProfile(+userId);
        if (response.status === 200) {
            setUserData(response.data);
        } else {
            navigate("/");
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    function handleAddingContent(): void {
        setIsUserAddingContent(!isUserAddingContent);
    }

    return (
        <>
            <div className="flex-1 w-4/5 mx-auto flex flex-col px-16 overflow-y-auto my-4">
                <div className="w-full pb-8 flex gap-8 py-8">
                    <div className="h-fit flex flex-col gap-4 px-8 py-8 duration-300 w-[480px]">
                        {loggedUserData?.id === +userId && (
                            <TbSettingsFilled
                                onClick={() => navigate("/settings")}
                                className="ml-auto text-2xl text-gray-400 transition-all hover:text-sky-500 hover:rotate-45 cursor-pointer duration-300"
                            />
                        )}
                        <AvatarComponent
                            className="shadow-darkMain"
                            username={userData?.username || ""}
                            size="big"
                            userId={+userId}
                        />
                        <div className="flex flex-col gap-4 w-full">
                            <h1 className="text-gray-100 text-3xl font-poppins text-center">
                                {userData?.username}
                            </h1>
                            <p className="text-gray-400 text-lg font-poppins line-clamp-4 break-word overflow-hidden text-center">
                                {userData?.description ||
                                    "This user has no description yet!"}
                            </p>
                        </div>
                    </div>
                    <Separator orientation="vertical" />
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full *:w-full bg-accent/40 hover:*:bg-background/40 space-x-2 *:text-base *:flex *:gap-2">
                            <TabsTrigger value="overview">
                                <TbBook />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="rules">
                                <TbFile />
                                Rules
                            </TabsTrigger>
                            <TabsTrigger value="rulesets">
                                <TbFolder />
                                Rulesets
                            </TabsTrigger>
                            <TabsTrigger value="environments">
                                <TbBriefcase />
                                Environments
                            </TabsTrigger>
                            {loggedUserData?.id === +userId && (
                                <div
                                    onClick={handleAddingContent}
                                    className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
                                >
                                    <TbPlus />
                                    Add Content
                                </div>
                            )}
                        </TabsList>
                        <TabsContent value="overview">
                            <Overview />
                        </TabsContent>
                        <TabsContent value="rules">
                            <Rules />
                        </TabsContent>
                        <TabsContent value="rulesets">
                            <Rulesets />
                        </TabsContent>
                        <TabsContent value="environments">
                            <Environments />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <ManageContentModal
                closeModal={handleAddingContent}
                open={isUserAddingContent}
            />
        </>
    );
}
