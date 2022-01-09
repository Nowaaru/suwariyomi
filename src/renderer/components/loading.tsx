import '../css/Loading.css';

const Loading = ({ loadingText = 'Loading' as string }) => {
  return (
    <div className="loading center">
      <div className="loadingio-spinner-pulse-p5j86z5hvvm">
        <div className="ldio-t5svxtfp8uc">
          <div />
          <div />
          <div />
        </div>
      </div>
      <span className="loadingText">{loadingText}</span>
    </div>
  );
};

export default Loading;
