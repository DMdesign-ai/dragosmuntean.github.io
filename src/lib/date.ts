/** "Sep 2025". US English because British short months print "Sept",
 *  the only four-letter month beside JAN / MAR / AUG. Natural case:
 *  where it sits in uppercase metadata, CSS sets the capitals. */
export const monthYear = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
