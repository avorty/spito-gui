import { ruleset } from "@renderer/lib/interfaces";
import { fetchUserRulests } from "@renderer/lib/user";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Loader from "@renderer/Layout/Loader";
import ManageContentModal from "../Components/Modals/ManageContentModal";
import Ruleset from "../Components/Ruleset";
import { calculateSkipAndTake, calculateTotalPages } from "@renderer/lib/utils";
import Pagination from "@renderer/Compontents/Pagination";

export default function Rulesets(): JSX.Element {
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [rulesets, setRulesets] = useState<Array<ruleset>>([]);
  const [isUserEditingRuleset, setIsUserEditingRuleset] = useState<boolean>(false);
  const [editedRulesetId, setEditedRulesetId] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const { userId = 0 } = useParams<{ userId: string }>();

  async function fetchRulesets(pageParam?: number, perPageParam?: number): Promise<void> {
    setIsFetching(true);
    const pageData = calculateSkipAndTake(pageParam || page, perPageParam || perPage);
    const fetchedRulesets = await fetchUserRulests(+userId, pageData.skip, pageData.take);
    if (fetchedRulesets) {
      setIsFetching(false);
      setRulesets(fetchedRulesets.data);
      setTotal(fetchedRulesets.count);
      setTotalPages(calculateTotalPages(fetchedRulesets.count, perPage));
    }
  }

  function handlePageChange(pageParam: number): void {
    setPage(pageParam);
    fetchRulesets(pageParam, perPage);
  }

  function handlePerPageChange(perPageParam: number): void {
    setPerPage(perPage);
    fetchRulesets(1, perPageParam);
  }

  function closeEditModal(): void {
    setIsUserEditingRuleset(false);
    fetchRulesets();
  }

  useEffect(() => {
    fetchRulesets();
  }, [userId]);

  return (
    <>
      {isUserEditingRuleset && (
        <ManageContentModal
          isUserEditing={true}
          closeModal={closeEditModal}
          rulesetId={editedRulesetId}
        />
      )}
      {isFetching ? (
        <Loader size="w-16 h-16 mt-8" />
      ) : (
        <AnimatePresence>
          {rulesets.length > 0 ? (
            rulesets.map((ruleset, i) => (
              <Ruleset
                ruleset={ruleset}
                setEditedRulesetId={setEditedRulesetId}
                setIsUserEditingRuleset={setIsUserEditingRuleset}
                index={i}
                where="profile"
                key={ruleset.id}
              />
            ))
          ) : (
            <p className="text-center text-gray-500 text-2xl font-poppins mt-10">
              This user has no rulesets!
            </p>
          )}
          <Pagination
            total={total}
            perPage={perPage}
            page={page}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
          />
        </AnimatePresence>
      )}
    </>
  );
}
