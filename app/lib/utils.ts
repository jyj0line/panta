const throttle = <T extends (...args: any[]) => any>
  (func: T, limit: number): (...args: Parameters<T>) => void => {
    let inThrottle: boolean = false;

    return (...args: Parameters<T>): void => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };

  export {throttle};