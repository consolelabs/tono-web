import {
  Modal,
  ModalClose,
  ModalContent,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  Typography,
  toast,
} from "@mochi-ui/core";
import { CloseLgLine } from "@mochi-ui/icons";
import { useEffect, useState } from "react";
import { FlexibleStakeContent } from "./flexible-stake-content";
import { FlexibleStakeResponse } from "./flexible-stake-response";
import { useFlexibleStaking } from "@/store/flexible-staking";
import { FlexibleStakePreview } from "./flexible-stake-preview";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FlexibleStakeModal = (props: Props) => {
  const { open, onOpenChange } = props;
  const { poolContract, stakingTokenContract, stakingToken, updateValues } =
    useFlexibleStaking();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [state, setState] = useState<"init" | "preview" | "success">("init");
  const [initializing, setInitializing] = useState(false);
  const [amount, setAmount] = useState(0);

  const onConfirm = (amount: number) => {
    setAmount(amount);
    setState("preview");
  };

  const onSuccess = () => {
    setState("success");
  };

  useEffect(() => {
    if (!poolContract || !stakingTokenContract) return;
    const init = async () => {
      try {
        setInitializing(true);
        await updateValues();
      } catch (err: any) {
        toast({
          scheme: "danger",
          title: "Error",
          description:
            typeof err.message === "string"
              ? err.message
              : "Failed to initialize contract interaction",
        });
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, [poolContract, stakingTokenContract, updateValues]);

  return (
    <Modal
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          setState("init");
        }
      }}
    >
      <ModalPortal>
        <ModalOverlay />
        <ModalContent
          className="w-full max-w-[530px] overflow-clip"
          ref={(ref) => {
            if (ref && ref !== container) {
              setContainer(ref);
            }
          }}
        >
          {state === "init" && (
            <ModalTitle className="relative pb-3">
              <Typography level="h6" fontWeight="lg" className="text-center">
                Stake {stakingToken?.token_symbol}
              </Typography>
              <ModalClose className="absolute inset-y-0 right-0 h-fit">
                <CloseLgLine className="w-7 h-7" />
              </ModalClose>
            </ModalTitle>
          )}
          {state === "preview" && (
            <ModalTitle className="relative pb-3">
              <Typography level="h6" fontWeight="lg">
                Preview Stake
              </Typography>
              <ModalClose className="absolute inset-y-0 right-0 h-fit">
                <CloseLgLine className="w-7 h-7" />
              </ModalClose>
            </ModalTitle>
          )}
          {state === "init" && (
            <FlexibleStakeContent {...{ container, initializing, onConfirm }} />
          )}
          {state === "preview" && (
            <FlexibleStakePreview {...{ amount, onSuccess }} />
          )}
          {state === "success" && (
            <FlexibleStakeResponse
              onClose={() => {
                onOpenChange(false);
                setTimeout(() => {
                  setState("init");
                }, 300);
              }}
            />
          )}
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
};
