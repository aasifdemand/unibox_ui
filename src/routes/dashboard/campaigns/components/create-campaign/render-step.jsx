import React from 'react'
import ImportLeadsStep from './import-leads-step';
import Step1Design from './design-step';
import { motion } from 'motion/react';
import SetupStep from './setup-step';
import Step3Finalize from './finalize-step';



const RenderStep = (props) => {
    const { currentStep, stepProps } = props;
   switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ImportLeadsStep {...stepProps} />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Step1Design {...stepProps} />
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SetupStep {...stepProps} />
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Step3Finalize {...stepProps} />
          </motion.div>
        );
      default:
        return null;
    }
}

export default RenderStep