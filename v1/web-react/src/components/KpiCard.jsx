const KpiCard = ({title, Icon, count}) => {
  return (
    <div className="bg-white/10 min-w-50 border border-gray-300 rounded-2xl bg-linear-to-r from-transparent to-transparent hover:from-white hover:to-purple-100/50 transition-all duration-3000 ease-in-out shadow-2xl">
      <h2 className="text-left text-md font-medium p-3 text-slate-700">
        {title}
      </h2>
      <div className="mx-3 mb-3 flex items-center gap-5">
        <Icon size={18} color="#64748B" />
        <h2 className="text-2xl font-semibold text-slate-800">{count}</h2>
      </div>
    </div>
  );
};

export default KpiCard;
