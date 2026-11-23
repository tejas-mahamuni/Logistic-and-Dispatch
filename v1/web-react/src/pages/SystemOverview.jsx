import MasterKpi from "../components/MasterKpi";
import DispatchKpi from "../components/DispatchKpi";

const SystemOverview = () => {

  return (
    <div className="h-full w-full p-6 bg-linear-to-r from-white to-purple-100">
      
      <MasterKpi/>

      <DispatchKpi/>
    </div>
  );
};

export default SystemOverview;