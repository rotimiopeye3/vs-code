/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IDE } from './components/IDE';
import { TooltipProvider } from "@/components/ui/tooltip";

export default function App() {
  return (
    <TooltipProvider>
      <div className="dark">
        <IDE />
      </div>
    </TooltipProvider>
  );
}
