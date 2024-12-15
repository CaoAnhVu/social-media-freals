import { useToast } from "@chakra-ui/react";
import { useCallback, useRef } from "react";

const useShowToast = () => {
  const toast = useToast();
  const toastIdRef = useRef();

  const showToast = useCallback(
    (title, description, status) => {
      // Kiểm tra nếu thông báo đã được hiển thị
      if (!toastIdRef.current) {
        toastIdRef.current = toast({
          title,
          description,
          status,
          duration: 1500,
          isClosable: true,
          onCloseComplete: () => {
            // Reset toastIdRef khi thông báo đóng
            toastIdRef.current = null;
          },
        });
      }
    },
    [toast]
  );

  return showToast;
};

export default useShowToast;
