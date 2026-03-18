const ErrorMessage = ({ message }) => {
  return (
    <div className="text-red-500 text-sm text-center">
      {message}
    </div>
  );
};

export default ErrorMessage;