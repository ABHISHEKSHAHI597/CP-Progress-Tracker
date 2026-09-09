/** An empty screen is an invitation to act, so it always names the next step. */
function EmptyState({ title, hint, action }) {
  return (
    <div className="border border-dashed border-line rounded-lg px-6 py-12 text-center">
      <p className="text-paper text-[15px]">{title}</p>
      {hint && <p className="text-mute text-[13.5px] mt-2 max-w-[46ch] mx-auto">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
